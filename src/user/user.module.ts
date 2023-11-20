import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { UserService } from "./user.service";
import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity]), ConfigModule],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule { }