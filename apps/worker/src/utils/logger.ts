import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  base: {
    service: 'worker',
    pid: process.pid,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function createJobLogger(jobName: string, jobId?: string) {
  return logger.child({ job: jobName, jobId });
}

export function createSourceLogger(sourceId: string, sourceName?: string) {
  return logger.child({ sourceId, sourceName });
}
