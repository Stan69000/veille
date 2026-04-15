import type { AiProviderType } from '@core/types';
import { AiProviderConfigSchema, AiRequestSchema, AiResponseSchema } from '../schemas/index.js';
import { ExternalServiceError } from '@core/errors';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiResponse {
  id: string;
  model: string;
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AiProvider {
  type: AiProviderType;
  name: string;
  isAvailable(): Promise<boolean>;
  complete(messages: AiMessage[], options?: AiCompletionOptions): Promise<AiResponse>;
  embeddings(text: string): Promise<number[]>;
}

export interface AiCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stop?: string[];
}

const DEFAULT_TIMEOUT = 60000;

export abstract class BaseAiProvider implements AiProvider {
  abstract type: AiProviderType;
  abstract name: string;
  
  protected apiKey?: string;
  protected baseUrl?: string;
  protected defaultModel: string;
  protected timeout: number;

  constructor(config: {
    apiKey?: string;
    baseUrl?: string;
    defaultModel?: string;
    timeout?: number;
  }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.defaultModel = config.defaultModel || 'gpt-4';
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
  }

  abstract isAvailable(): Promise<boolean>;
  abstract complete(messages: AiMessage[], options?: AiCompletionOptions): Promise<AiResponse>;
  abstract embeddings(text: string): Promise<number[]>;

  protected async fetch(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  protected parseResponse(response: Response): Promise<unknown> {
    return response.json();
  }
}

export class OpenAIProvider extends BaseAiProvider {
  type: AiProviderType = 'OPENAI';
  name = 'OpenAI';

  private get baseApiUrl(): string {
    return this.baseUrl || 'https://api.openai.com/v1';
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const response = await this.fetch(`${this.baseApiUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async complete(messages: AiMessage[], options?: AiCompletionOptions): Promise<AiResponse> {
    const model = options?.model || this.defaultModel;
    
    const requestBody = {
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
      top_p: options?.topP,
      stop: options?.stop,
    };

    const validated = AiRequestSchema.parse(requestBody);

    const response = await this.fetch(`${this.baseApiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(validated),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ExternalServiceError(this.name, `API error: ${response.status} - ${error}`);
    }

    const data = await this.parseResponse(response);
    const validatedResponse = AiResponseSchema.parse(data);

    const choice = validatedResponse.choices[0];
    if (!choice) {
      throw new ExternalServiceError(this.name, 'No response choices returned');
    }

    return {
      id: validatedResponse.id,
      model: validatedResponse.model,
      content: choice.message.content,
      usage: validatedResponse.usage ? {
        promptTokens: validatedResponse.usage.promptTokens,
        completionTokens: validatedResponse.usage.completionTokens,
        totalTokens: validatedResponse.usage.totalTokens,
      } : undefined,
    };
  }

  async embeddings(text: string): Promise<number[]> {
    const response = await this.fetch(`${this.baseApiUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      throw new ExternalServiceError(this.name, 'Failed to generate embeddings');
    }

    const data = await this.parseResponse(response) as { data: Array<{ embedding: number[] }> };
    return data.data[0]?.embedding || [];
  }
}

export class AnthropicProvider extends BaseAiProvider {
  type: AiProviderType = 'ANTHROPIC';
  name = 'Anthropic';

  private get baseApiUrl(): string {
    return this.baseUrl || 'https://api.anthropic.com/v1';
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;
    return true;
  }

  async complete(messages: AiMessage[], options?: AiCompletionOptions): Promise<AiResponse> {
    const model = options?.model || this.defaultModel;
    
    const systemMessage = messages.find((m) => m.role === 'system');
    const userMessages = messages.filter((m) => m.role !== 'system');
    const lastUserMessage = userMessages[userMessages.length - 1];

    const response = await this.fetch(`${this.baseApiUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey!,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        system: systemMessage?.content,
        messages: lastUserMessage ? [{ role: 'user', content: lastUserMessage.content }] : [],
        max_tokens: options?.maxTokens ?? 2000,
        temperature: options?.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ExternalServiceError(this.name, `API error: ${response.status} - ${error}`);
    }

    const data = await this.parseResponse(response) as {
      id: string;
      model: string;
      content: Array<{ type: string; text: string }>;
      usage: { input_tokens: number; output_tokens: number };
    };

    return {
      id: data.id,
      model: data.model,
      content: data.content[0]?.text || '',
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  }

  async embeddings(_text: string): Promise<number[]> {
    throw new ExternalServiceError(this.name, 'Anthropic does not support embeddings API');
  }
}

export function createProvider(
  type: AiProviderType,
  config: { apiKey?: string; baseUrl?: string; defaultModel?: string }
): AiProvider {
  switch (type) {
    case 'OPENAI':
      return new OpenAIProvider(config);
    case 'ANTHROPIC':
      return new AnthropicProvider(config);
    default:
      throw new Error(`Unknown AI provider type: ${type}`);
  }
}
