import { Module } from "@nestjs/common";
import { TelegramService } from "./telegram.service";
import { UserModule } from "src/user/user.module";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [UserModule,ConfigModule
    ],
    providers: [TelegramService],
    exports: [TelegramService],
})
export class TelegramModule { }