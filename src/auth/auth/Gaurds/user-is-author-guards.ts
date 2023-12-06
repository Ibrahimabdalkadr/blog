import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Observable, map, switchMap } from "rxjs";
import { BlogEntry } from "src/blog/blog/modal/blog-entry.interface";
import { BlogService } from "src/blog/blog/services/BlogService.service";
import { User } from "src/user/user/modal/user.interface";
import { UserService } from "src/user/user/service/user.service";

@Injectable()
export class UserIsAuthorGuards implements CanActivate {
    constructor(
        private userServices: UserService,
        private blogService: BlogService,
    ) {}
    canActivate(context: ExecutionContext): boolean | Observable<boolean> | Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const param = req.params;
        const blogEntryId: number = Number(param.id);
        const user: User = req.user;

        return this.userServices.findOne(user.id).pipe(
            switchMap((foundUser: User) =>
                this.blogService.findOne(blogEntryId).pipe(
                    map((blogEntry: BlogEntry) => {
                        let hasPermission = false;
                        if (foundUser.id === blogEntry.author.id) {
                            hasPermission = true;
                        }
                        return foundUser && hasPermission;
                    }),
                ),
            ),
        );
    }
}
