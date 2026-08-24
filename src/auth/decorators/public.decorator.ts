import { SetMetadata } from '@nestjs/common';

export const IS__PUBLIC_KEY = 'isPublic';
export const Public = (...args: string[]) => SetMetadata(IS__PUBLIC_KEY, args);
