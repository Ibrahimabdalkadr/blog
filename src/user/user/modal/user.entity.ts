import { BlogEntryEntity } from "src/blog/blog/modal/blog-entry.entity";
import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "./user.interface";

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column({ unique: true })
    username: string;
    @Column({ unique: true })
    email: string;
    @Column({ select: false })
    password: string;
    @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
    role: UserRole;
    @OneToMany((type) => BlogEntryEntity, (blogEntryEntity) => blogEntryEntity.author)
    blogEntries: BlogEntryEntity[];

    @Column({ nullable: true })
    profileImage: string;
    @BeforeInsert()
    emailTolowerCase() {
        this.email = this.email.toLowerCase();
    }
}
