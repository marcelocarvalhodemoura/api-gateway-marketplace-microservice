import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuardGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    const ip = typeof req.ip === 'string' ? req.ip : '';
    const userAgentHeader = (
      req.headers as Record<string, string | string[] | undefined> | undefined
    )?.['user-agent'];
    const userAgent = Array.isArray(userAgentHeader)
      ? (userAgentHeader[0] ?? '')
      : typeof userAgentHeader === 'string'
        ? userAgentHeader
        : '';

    return Promise.resolve(`${ip}-${userAgent}`);
  }
}
