import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { BlogEntry } from "../modal/blog-entry.interface";
import { Observable, of } from "rxjs";
import { JwtAuthGuards } from "src/auth/auth/Gaurds/jwt-gaurds";
import { BlogService } from "../services/BlogService.service";
import { UserIsAuthorGuards } from "src/auth/auth/Gaurds/user-is-author-guards";
import { Pagination } from "nestjs-typeorm-paginate";
import { FileInterceptor } from "@nestjs/platform-express";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import { diskStorage } from "multer";
import { image } from "../modal/image-interface";
import { join } from "path/posix";
const BLOG_ENTRY_URL = "http://localhost:3000/api/blog";
export const storage = {
    storage: diskStorage({
        destination: "./uploads/blog-image",
        filename: (req, file, cb) => {
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, "") + uuidv4();
            const extension: string = path.parse(file.originalname).ext;
            cb(null, `${filename}${extension}`);
        },
    }),
};
@Controller("blog")
export class BlogController {
    constructor(private blogService: BlogService) {}
    @UseGuards(JwtAuthGuards)
    @Post()
    create(@Body() blogEntry: BlogEntry, @Request() req): Observable<BlogEntry> {
        const user = req.user;
        return this.blogService.create(user, blogEntry);
    }
    // @Get()
    // findBlogEntries(@Query("userId") userId: number): Observable<BlogEntry[]> {
    //     if (userId === null) {
    //         return this.blogService.findAll();
    //     } else {
    //         return this.blogService.findByUser(userId);
    //     }
    // }
    @Get("")
    index(@Query("page") page: number = 1, @Query("limit") limit: number = 10): Observable<Pagination<BlogEntry>> {
        limit = limit > 100 ? 100 : limit;
        return this.blogService.paginationAll({
            limit: Number(limit),
            page: Number(page),
            route: BLOG_ENTRY_URL,
        });
    }
    @Get("user/:userId")
    indexByUser(@Query("page") page: number = 1, @Query("limit") limit: number = 10, @Param("userId") userId: number): Observable<Pagination<BlogEntry>> {
        limit = limit > 100 ? 100 : limit;
        return this.blogService.indexByUser(
            {
                limit: Number(limit),
                page: Number(page),
                route: BLOG_ENTRY_URL,
            },
            Number(userId),
        );
    }
    // @Get(":id")
    // findOne(@Param("id") id: number) {
    //     return this.blogService.findOne(id);
    // }
    @UseGuards(JwtAuthGuards, UserIsAuthorGuards)
    @Put(":id")
    updateOne(@Param("id") id: number, @Body() blogEntry: BlogEntry): Observable<BlogEntry> {
        return this.blogService.updateOne(id, blogEntry);
    }
    @UseGuards(JwtAuthGuards, UserIsAuthorGuards)
    @Delete(":id")
    deleteOne(@Param("id") id: number): Observable<BlogEntry> {
        return this.blogService.deleteOne(id);
    }
    @UseGuards(JwtAuthGuards)
    @Post("img/upload")
    @UseInterceptors(FileInterceptor("file", storage))
    uploadedFile(@UploadedFile() file, @Request() req): Observable<image> {
        return of(file);
    }
    @UseGuards(JwtAuthGuards)
    @Get("img/:imagename")
    findImage(@Param("imagename") imageName: string, @Res() res): Observable<image> {
        return of(res.sendFile(join(process.cwd(), "/uploads/blog-image/" + imageName)));
    }
}
