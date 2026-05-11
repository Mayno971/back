import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { Role } from './roles.enum';

export const ROLES_KEY = 'roles' as const;

export const Roles = (...roles: Role[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);
