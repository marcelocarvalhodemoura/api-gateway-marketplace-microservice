import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerRequest, ThrottlerStorage } from '@nestjs/throttler';
import { CustomThrottlerGuardGuard } from './throttler-guard.guard';

class TestableThrottlerGuard extends CustomThrottlerGuardGuard {
  constructor(storage: ThrottlerStorage = { increment: jest.fn() }) {
    super([], storage, new Reflector());
  }

  public track(req: Record<string, unknown>) {
    return this.getTracker(req);
  }

  public handle(requestProps: ThrottlerRequest) {
    return this.handleRequest(requestProps);
  }
}

describe('CustomThrottlerGuardGuard', () => {
  it('should be defined', () => {
    expect(CustomThrottlerGuardGuard).toBeDefined();
  });

  it('builds a tracker from ip and user-agent', async () => {
    const guard = new TestableThrottlerGuard();

    await expect(
      guard.track({
        ip: '127.0.0.1',
        headers: { 'user-agent': 'jest-agent' },
      }),
    ).resolves.toBe('127.0.0.1-jest-agent');
  });

  it('sets Retry-After and throws when the limit is exceeded', async () => {
    const setHeader = jest.fn();
    const increment = jest.fn().mockResolvedValue({
      totalHits: 6,
      timeToExpire: 1,
      isBlocked: true,
      timeToBlockExpire: 1,
    });
    const guard = new TestableThrottlerGuard({ increment });
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          ip: '127.0.0.1',
          headers: { 'user-agent': 'jest-agent' },
        }),
        getResponse: () => ({ setHeader }),
      }),
      getHandler: () => function handler() {},
      getClass: () => class TestController {},
    } as unknown as ExecutionContext;

    await expect(
      guard.handle({
        context,
        limit: 5,
        ttl: 1000,
      } as ThrottlerRequest),
    ).rejects.toThrow();

    expect(setHeader).toHaveBeenCalledWith('Retry-After', 1);
  });
});
