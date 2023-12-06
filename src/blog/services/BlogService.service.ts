import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogEntryEntity } from "../modal/blog-entry.entity";
import { Repository } from "typeorm";
import { UserService } from "src/user/user/service/user.service";
import { BlogEntry } from "../modal/blog-entry.interface";
import { User } from "src/user/user/modal/user.interface";
import { Observable, from, map, of, pipe, switchMap } from "rxjs";
import { IPaginationOptions, Pagination, paginate } from "nestjs-typeorm-paginate";
const slugify = require("slugify");
@Injectable()
export class BlogService {
    constructor(
        @InjectRepository(BlogEntryEntity) private readonly blogRepository: Repository<BlogEntry>,
        private userService: UserService,
    ) {}

    create(user: User, blogEntry: BlogEntry): Observable<BlogEntry> {
        blogEntry.author = user;
        return this.generateSlug(blogEntry.title).pipe(
            switchMap((slug: string) => {
                blogEntry.slug = slug;
                return from(this.blogRepository.save(blogEntry));
            }),
        );
    }
    generateSlug(title: string) {
        return of(slugify(title));
    }

    findAll(): Observable<BlogEntry[]> {
        return from(this.blogRepository.find({ relations: ["author"] }));
    }
    paginationAll(options: IPaginationOptions): Observable<Pagination<BlogEntry>> {
        return from(paginate<BlogEntry>(this.blogRepository, options, { relations: ["author"] })).pipe(
            map((blogEntry: Pagination<BlogEntry>) => {
                console.log(blogEntry);
                return blogEntry;
            }),
        );
    }
    indexByUser(options: IPaginationOptions, userId): Observable<Pagination<BlogEntry>> {
        return from(
            paginate<BlogEntry>(this.blogRepository, options, {
                relations: ["author"],
                where: {
                    author: {
                        id: userId,
                    },
                },
            }),
        ).pipe(map((blogEntry: Pagination<BlogEntry>) => blogEntry));
    }
    findByUser(userId: number): Observable<BlogEntry[]> {
        return from(
            this.blogRepository.find({
                where: {
                    author: {
                        id: userId,
                    },
                },
                relations: [`author`],
            }),
        ).pipe(map((blogEntries: BlogEntry[]) => blogEntries));
    }
    findOne(id: number): Observable<BlogEntry> {
        return from(
            this.blogRepository.findOne({
                where: {
                    id: id,
                },

                relations: ["author"],
            }),
        );
    }
    updateOne(id: number, blogEntry: BlogEntry) {
        return from(this.blogRepository.update(id, blogEntry)).pipe(switchMap(() => this.findOne(id)));
    }
    deleteOne(id: number): Observable<any> {
        return from(this.blogRepository.delete(id));
    }
}
