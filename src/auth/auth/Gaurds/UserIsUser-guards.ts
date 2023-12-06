import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Observable, map } from "rxjs";
import { User } from "src/user/user/modal/user.interface";
import { UserService } from "src/user/user/service/user.service";

@Injectable()
export class UserIsUserGuards implements CanActivate {
    constructor(private userServices: UserService) {}
    canActivate(context: ExecutionContext): boolean | Observable<boolean> | Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const params = req.params;
        const user = req.user;
        return this.userServices.findOne(user.id).pipe(
            map((user: User) => {
                let hasPermission = false;
                if (user.id === Number(params.id)) {
                    hasPermission = true;
                }
                return user && hasPermission;
            }),
        );
    }
}
