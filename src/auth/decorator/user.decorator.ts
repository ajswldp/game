import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../user/user';

interface UserRequest extends Request {
  user: User;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<UserRequest>();
    return request.user;
  },
);
