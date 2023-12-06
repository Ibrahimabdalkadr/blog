import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../modal/user.entity";
import { Like, Repository } from "typeorm";
import { User, UserRole } from "../modal/user.interface";
import { Observable, catchError, from, map, pipe, switchMap, throwError } from "rxjs";
import { AuthService } from "src/auth/auth/auth.service";
import { match } from "assert";
import { IPaginationOptions, Pagination, paginate } from "nestjs-typeorm-paginate";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private auth: AuthService,
    ) {}
    create(user: User): Observable<User> {
        return this.auth.hasPassword(user.password).pipe(
            switchMap((passwordHash: string) => {
                const newUser = new UserEntity();
                newUser.name = user.name;
                newUser.email = user.email;
                newUser.username = user.username;
                newUser.id = user.id;
                newUser.password = passwordHash;
                newUser.role = UserRole.USER;
                return from(this.userRepository.save(newUser)).pipe(
                    map((user: User) => {
                        const { password, ...result } = user;
                        return result;
                    }),
                    catchError((err) => throwError(err)),
                );
            }),
        );
    }
    findOne(id: number): Observable<User> {
        return from(
            this.userRepository.findOne({
                where: { id },
                relations: ["blogEntries"],
            }),
        ).pipe(
            map((user: User) => {
                const { password, ...result } = user;
                return result;
            }),
        );
    }
    findAll(): Observable<User[]> {
        return from(this.userRepository.find()).pipe(
            map((users: User[]) => {
                users.forEach((v) => {
                    delete v.password;
                });
                return users;
            }),
        );
    }
    paginate(option: IPaginationOptions): Observable<Pagination<User>> {
        return from(paginate<User>(this.userRepository, option)).pipe(
            map((usersPageable: Pagination<User>) => {
                usersPageable.items.forEach(function (v) {
                    delete v.password;
                });
                return usersPageable;
            }),
        );
    }
    paginateFilterByUsername(options: IPaginationOptions, username: string): Observable<Pagination<User>> {
        return from(
            this.userRepository.findAndCount({
                skip: +options.page * +options.limit || 0,
                take: +options.limit || 10,
                select: ["id", "name", "username", "email", "role"],
                relations: ["blogEntries"],
                where: [{ username: Like(`%${username}%`) }],
            }),
        ).pipe(
            map(([users, totalUser]) => {
                const usersPageable: Pagination<User> = {
                    items: users,
                    links: {
                        first: options.route + `?limit=${options.limit}`,
                        previous: options.route + ``,
                        next: options.route + `?${options.limit}&page=${+options.page + 1}`,
                        last: options.route + `?${options.limit}&page=${Math.ceil(totalUser / +options.limit)}`,
                    },
                    meta: {
                        currentPage: +options.page,
                        itemCount: users.length,
                        itemsPerPage: +options.limit,
                        totalPages: Math.ceil(totalUser / +options.limit),
                    },
                };
                return usersPageable;
            }),
        );
    }

    deleteOne(id: number): Observable<any> {
        return from(this.userRepository.delete(id));
    }
    updateOne(id: number, user: User): Observable<any> {
        delete user.email;
        delete user.password;
        delete user.role;

        return from(this.userRepository.update(id, user)).pipe(switchMap(() => this.findOne(id)));
    }
    updateRoleOfUser(id: number, user: User): Observable<any> {
        return from(this.userRepository.update(id, user));
    }
    login(user: User) {
        return this.validateUser(user.email, user.password).pipe(
            switchMap((user: User) => {
                if (user) {
                    return this.auth.generateJwt(user).pipe(map((jwt: string) => jwt));
                } else return "wrong Credentials";
            }),
        );
    }
    findByEmail(email: string) {
        return from(this.userRepository.findOne({ where: { email } }));
    }
    validateUser(email: string, password: string): Observable<User> {
        return from(
            this.userRepository.findOne({
                where: {
                    email,
                },
                select: ["id", "password", "name", "username", "email", "role", "profileImage"],
            }),
        ).pipe(
            switchMap((user: User) =>
                this.auth.comparePassword(password, user.password).pipe(
                    map((match: boolean) => {
                        if (match) {
                            const { password, ...result } = user;
                            return result;
                        } else {
                            throw Error;
                        }
                    }),
                ),
            ),
        );
    }
}
