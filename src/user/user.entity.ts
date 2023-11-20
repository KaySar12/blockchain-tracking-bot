import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    userId: string;

    @Column('text')
    username: string;

    @CreateDateColumn()
    createdDate: Date;
}