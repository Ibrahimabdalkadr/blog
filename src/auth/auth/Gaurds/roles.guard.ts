import { CanActivate, ExecutionContext, Inject, Injectable, forwardRef } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, map } from "rxjs";
import { User } from "src/user/user/modal/user.interface";
import { UserService } from "src/user/user/service/user.service";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private userService: UserService,
    ) {}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.get<string[]>("roles", context.getHandler());
        if (!roles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user: User = request.user;
        return this.userService.findOne(user.id).pipe(
            map((user: User) => {
                const hasRoles = () => roles.indexOf(user.role) > -1;

                let hasPermission = false;
                if (hasRoles()) {
                    hasPermission = true;
                }
                return user && hasPermission;
            }),
        );
    }
}
