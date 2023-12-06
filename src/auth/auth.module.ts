import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth/auth.service";
import { env } from "process";
import { RolesGuard } from "./auth/Gaurds/roles.guard";
import { JwtStrategy } from "./auth/Gaurds/jwt-stratgy";
import { JwtAuthGuards } from "./auth/Gaurds/jwt-gaurds";
import { UserModule } from "src/user/user/user.module";
@Module({
    imports: [
        forwardRef(() => UserModule),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: "100s" },
            }),
        }),
    ],
    providers: [AuthService, RolesGuard, JwtAuthGuards, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
