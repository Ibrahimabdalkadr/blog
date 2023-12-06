import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "./user/user/user.module";
import { AuthModule } from "./auth/auth.module";
import { BlogModule } from "./blog/blog/blog.module";
import { BlogController } from "./blog/blog/contoller/blog.controller";
import { BlogEntryEntity } from "./blog/blog/modal/blog-entry.entity";
import { Repository } from "typeorm";
import { BlogService } from "./blog/blog/services/BlogService.service";
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
            type: "postgres",
            url: process.env.DATABASE_URL,
            autoLoadEntities: true,
            synchronize: true,
        }),
        TypeOrmModule.forFeature([BlogEntryEntity]),
        UserModule,
        AuthModule,
        BlogModule,
    ],
    controllers: [AppController, BlogController],
    providers: [AppService, BlogService],
})
export class AppModule {}
