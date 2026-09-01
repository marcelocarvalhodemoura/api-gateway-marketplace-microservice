import { Request } from 'express';
import type { UserSession } from '../service/auth.service';

export type AuthenticatedUser = NonNullable<UserSession['user']>;

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};
