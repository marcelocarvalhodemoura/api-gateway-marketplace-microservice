import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerRequest,
} from '@nestjs/throttler';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ServerResponse } from 'http';

type HeaderResponse = Pick<ServerResponse, 'setHeader'>;

@Injectable()
export class CustomThrottlerGuardGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    const { ip, headers } = req as Pick<Request, 'ip' | 'headers'>;
    const userAgentHeader = headers['user-agent'];
    const userAgent = Array.isArray(userAgentHeader)
      ? userAgentHeader.join(',')
      : (userAgentHeader ?? '');
    return Promise.resolve(`${ip ?? ''}-${userAgent}`);
  }

  protected getRequestResponse(context: ExecutionContext): {
    req: Request;
    res: HeaderResponse;
  } {
    const http = context.switchToHttp();
    return {
      req: http.getRequest<Request>(),
      res: http.getResponse<HeaderResponse>(),
    };
  }

  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { context, limit, ttl } = requestProps;
    const { req, res } = this.getRequestResponse(context);
    const throttles = this.reflector.get<Record<string, number>>(
      'throttle',
      context.getHandler(),
    );
    const throttlerName = throttles ? Object.keys(throttles)[0] : 'default';
    const tracker = await this.getTracker(req);
    const key = this.generateKey(context, tracker, throttlerName);

    const { totalHits, isBlocked } = await this.storageService.increment(
      key,
      ttl,
      limit,
      0,
      throttlerName,
    );

    if (isBlocked || totalHits > limit) {
      res.setHeader('Retry-After', Math.round(ttl / 1000));
      throw new ThrottlerException();
    }

    return true;
  }
}
