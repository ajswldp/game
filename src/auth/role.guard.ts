import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

const matchRoles = (roles: string[], userRole: string) => {
  return roles.some((role) => role === userRole);
};

interface UserRequest extends Request {
  user: {
    role: string;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    //- `roles`로 데코레이터로 설정된 롤 배열(`['member']`)이 들어옵니다.
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest<UserRequest>();
    const user = request.user;
    console.log('RolesGuard-canActivate', user, roles);
    return matchRoles(roles, user.role);
  }
}
