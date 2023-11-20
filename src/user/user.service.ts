import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
    constructor(@InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>) { }
    async findAll(): Promise<Array<UserEntity>> {
        return await this.userRepository.find();
    }
    async registerUser(createUser: any) {
        let exist = await this.userRepository.findOne({ where: { userId: createUser.userId } });
        if (exist) {
            return undefined;
        }
        const user = this.userRepository.create(createUser);
        if (user) {
            const saveUser = await this.userRepository.save(user);
            return Object(saveUser);
        }
        return undefined;
    }
}