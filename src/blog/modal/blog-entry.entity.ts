import { UserEntity } from "src/user/user/modal/user.entity";
import { BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
@Entity("blog_entry")
export class BlogEntryEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    title: string;
    @Column()
    slug: string;
    @Column({ default: "" })
    description: string;
    @Column({ default: "" })
    body: string;
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created: Date;
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    updated: Date;
    @BeforeUpdate()
    updateTimeStamp() {
        this.updated = new Date();
    }
    @Column({ default: 0 })
    likes: number;

    @Column({ nullable: true })
    headerImage: string;
    @Column({ nullable: true })
    publishedDate: Date;
    @Column({ nullable: true })
    isPublished: boolean;
    @ManyToOne((type) => UserEntity, (user) => user.blogEntries)
    author: UserEntity;
}
/////////////////////////////////////
