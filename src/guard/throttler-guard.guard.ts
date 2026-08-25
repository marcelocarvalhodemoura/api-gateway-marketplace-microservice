import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerRequest,
} from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class CustomThrottlerGuardGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    const trackerReq = req as unknown as {
      ip?: unknown;
      headers?: unknown;
    };
    const ip = typeof trackerReq.ip === 'string' ? trackerReq.ip : '';
    const headers =
      trackerReq.headers && typeof trackerReq.headers === 'object'
        ? (trackerReq.headers as Record<string, unknown>)
        : {};
    const userAgentHeader = headers['user-agent'];
    const userAgent = Array.isArray(userAgentHeader)
      ? typeof userAgentHeader[0] === 'string'
        ? userAgentHeader[0]
        : ''
      : typeof userAgentHeader === 'string'
        ? userAgentHeader
        : '';

    return Promise.resolve(`${ip}-${userAgent}`);
  }

  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { context, limit, ttl, throttler, blockDuration } = requestProps;
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const throttles = this.reflector.get<Record<string, number>>(
      'throttle',
      context.getHandler(),
    );
    const throttlerName =
      throttles && Object.keys(throttles)[0]
        ? Object.keys(throttles)[0]
        : (throttler.name ?? 'default');
    const tracker = await this.getTracker(request);
    const key = this.generateKey(context, tracker, throttlerName);

    const { totalHits, timeToExpire, isBlocked } =
      await this.storageService.increment(
        key,
        ttl,
        limit,
        blockDuration,
        throttlerName,
      );

    if (isBlocked || totalHits > limit) {
      response.setHeader('Retry-After', Math.round(ttl / 1000));
      throw new ThrottlerException();
    }

    response.setHeader(`${this.headerPrefix}-Limit`, limit);
    response.setHeader(
      `${this.headerPrefix}-Remaining`,
      Math.max(0, limit - totalHits),
    );
    response.setHeader(
      `${this.headerPrefix}-Reset`,
      Math.round(timeToExpire / 1000),
    );

    return true;
  }
}
