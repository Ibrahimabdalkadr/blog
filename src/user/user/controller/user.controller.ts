import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, Request, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "../service/user.service";
import { User, UserRole } from "../modal/user.interface";
import { Observable, catchError, map, of } from "rxjs";
import { hasRoles } from "src/auth/auth/decoretor/roles.decore";
import { JwtAuthGuards } from "src/auth/auth/Gaurds/jwt-gaurds";
import { RolesGuard } from "src/auth/auth/Gaurds/roles.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import { UserIsUserGuards } from "src/auth/auth/Gaurds/UserIsUser-guards";

export const storage = {
    storage: diskStorage({
        destination: "./uploads/profile-images",
        filename: (req, file, cb) => {
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, "") + uuidv4();
            const extension: string = path.parse(file.originalname).ext;
            cb(null, `${filename}${extension}`);
        },
    }),
};
@Controller("user")
export class UserController {
    constructor(readonly userService: UserService) {}
    @Post()
    create(@Body() user: User): Observable<User | Object> {
        return this.userService.create(user).pipe(
            map((user: User) => user),
            catchError((err) => of({ err: err.massage })),
        );
    }
    @Post("login")
    login(@Body() user: User): Observable<object> {
        return this.userService.login(user).pipe(
            map((jwt: string) => {
                return { access_token: jwt };
            }),
        );
    }
    @Get(":id")
    findOne(@Param() params): Observable<User> {
        return this.userService.findOne(params.id);
    }
    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuards, RolesGuard)
    @Get()
    findAll(@Query("page") page: number = 1, @Query("limit") limit: number = 10, @Query("username") username: string) {
        limit = limit > 100 ? 1000 : limit;
        if (username === null || username === undefined) {
            return this.userService.paginate({ page: Number(page), limit: Number(limit), route: "http://locathost:3000/user" });
        } else {
            return this.userService.paginateFilterByUsername({ page: Number(page), limit: Number(limit), route: "http://locathost:3000/user" }, username);
        }
    }
    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuards, RolesGuard)
    @Delete(":id")
    deleteOne(@Param() id: number): Observable<User> {
        return this.userService.deleteOne(id);
    }
    @UseGuards(JwtAuthGuards, UserIsUserGuards)
    @Put(":id")
    updateOne(@Param("id") id: string, @Body() user: User): Observable<any> {
        return this.userService.updateOne(Number(id), user);
    }
    @hasRoles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuards, RolesGuard)
    @Put(":id/role")
    updateRoleOfOne(@Param("id") id: string, @Body() user: User): Observable<any> {
        return this.userService.updateRoleOfUser(Number(id), user);
    }
    @UseGuards(JwtAuthGuards)
    @Post("upload")
    @UseInterceptors(FileInterceptor("file", storage))
    uploadedFile(@UploadedFile() file, @Request() req): Observable<Object> {
        const user: User = req.user;
        user.profileImage = file.filename;
        return this.userService.updateOne(user.id, user).pipe(map((user: User) => ({ profileImage: user.profileImage })));
    }
}
