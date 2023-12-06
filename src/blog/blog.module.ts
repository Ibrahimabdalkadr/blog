import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogEntryEntity } from "./modal/blog-entry.entity";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user/user.module";
import { BlogController } from "./contoller/blog.controller";
import { UserEntity } from "src/user/user/modal/user.entity";
import { BlogService } from "./services/BlogService.service";

@Module({
    imports: [TypeOrmModule.forFeature([BlogEntryEntity]), AuthModule, UserModule],
    controllers: [BlogController],
    providers: [BlogService],
})
export class BlogModule {}
