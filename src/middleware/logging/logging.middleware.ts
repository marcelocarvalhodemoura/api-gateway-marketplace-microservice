import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') ?? 'unknown';
    const startTime = Date.now();

    this.logger.log(
      `Incoming request: ${method} ${originalUrl} - User-Agent: ${userAgent} - IP:${ip}`,
    );

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') ?? '0';
      const duration = Date.now() - startTime;

      this.logger.log(
        `Outgoing Response: ${method} ${originalUrl} ${statusCode} ${contentLength}b - ${duration}ms - User-Agent: ${userAgent} - IP:${ip}`,
      );

      if (statusCode >= 400) {
        this.logger.warn(
          `Error Response: ${method} ${originalUrl} ${statusCode} ${contentLength}b - ${duration}ms - User-Agent: ${userAgent} - IP:${ip}`,
        );
      }
    });

    res.on('error', (err) => {
      this.logger.error(
        `Response Error: ${method} ${originalUrl} - Error: ${err.message}`,
      );
    });

    req.on('timeout', () => {
      this.logger.warn(
        `Request Timeout: ${method} ${originalUrl} -${Date.now() - startTime}ms - IP:${ip}`,
      );
      res.status(504).send('Request Timeout');
    });

    next();
  }
}
