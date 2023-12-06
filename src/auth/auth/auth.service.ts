import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable, from, of } from "rxjs";
import { User } from "src/user/user/modal/user.interface";
const bcrypt = require("bcrypt");
@Injectable()
export class AuthService {
    constructor(readonly jwtService: JwtService) {}
    generateJwt(user: User): Observable<string> {
        return from(this.jwtService.signAsync({ user }));
    }
    hasPassword(password: string): Observable<string> {
        return from<string>(bcrypt.hash(password, 12));
    }
    comparePassword(newPassword: string, passwordHash: string): Observable<boolean> {
        return of<boolean>(bcrypt.compare(newPassword, passwordHash));
    }
}
