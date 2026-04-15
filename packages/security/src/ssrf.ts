import { SSRFError } from '@core/errors';

const BLOCKED_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^224\./,
  /^240\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
  /^ffff:0:ffff:/,
];

const BLOCKED_HOSTNAMES = [
  'localhost',
  '0.0.0.0',
  'metadata.google.internal',
  '169.254.169.254',
  'metadata.aws',
];

const ALLOWED_PROTOCOLS = ['https:', 'http:'];

interface SSRFCheckOptions {
  allowedDomains?: string[];
  blockedDomains?: string[];
  allowedPorts?: number[];
  blockedPorts?: number[];
  followRedirects?: boolean;
  maxRedirects?: number;
}

export function isBlockedIP(ip: string): boolean {
  return BLOCKED_IP_RANGES.some((range) => range.test(ip));
}

export function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return BLOCKED_HOSTNAMES.includes(lower);
}

export function isValidPort(port: number): boolean {
  return port > 0 && port < 65536;
}

export function isAllowedPort(port: number, allowedPorts?: number[]): boolean {
  if (!allowedPorts || allowedPorts.length === 0) {
    return port >= 80 && port <= 443;
  }
  return allowedPorts.includes(port);
}

export function isAllowedDomain(domain: string, allowedDomains?: string[]): boolean {
  if (!allowedDomains || allowedDomains.length === 0) return true;
  
  const lower = domain.toLowerCase();
  return allowedDomains.some(
    (allowed) => lower === allowed || lower.endsWith(`.${allowed}`)
  );
}

export function isBlockedDomain(domain: string, blockedDomains?: string[]): boolean {
  if (!blockedDomains || blockedDomains.length === 0) return false;
  
  const lower = domain.toLowerCase();
  return blockedDomains.some(
    (blocked) => lower === blocked || lower.endsWith(`.${blocked}`)
  );
}

export async function checkSSRF(
  url: string,
  options: SSRFCheckOptions = {}
): Promise<{ safe: boolean; reason?: string }> {
  try {
    const parsed = new URL(url);

    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return { safe: false, reason: `Protocol ${parsed.protocol} not allowed` };
    }

    if (isBlockedHostname(parsed.hostname)) {
      return { safe: false, reason: `Hostname ${parsed.hostname} is blocked` };
    }

    const hostname = parsed.hostname;
    
    if (isBlockedDomain(hostname, options.blockedDomains)) {
      return { safe: false, reason: `Domain ${hostname} is blocked` };
    }

    if (!isAllowedDomain(hostname, options.allowedDomains)) {
      return { safe: false, reason: `Domain ${hostname} not in allowed list` };
    }

    const port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
    
    if (!isValidPort(port)) {
      return { safe: false, reason: `Invalid port ${port}` };
    }

    if (!isAllowedPort(port, options.allowedPorts)) {
      return { safe: false, reason: `Port ${port} not allowed` };
    }

    return { safe: true };
  } catch (error) {
    return { safe: false, reason: `Invalid URL: ${error}` };
  }
}

export async function validateURL(url: string, options?: SSRFCheckOptions): Promise<void> {
  const result = await checkSSRF(url, options);
  if (!result.safe) {
    throw new SSRFError(url);
  }
}

export function createSSRFGuard(options: SSRFCheckOptions = {}) {
  return async function guard(url: string): Promise<void> {
    await validateURL(url, options);
  };
}
