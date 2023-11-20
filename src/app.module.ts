import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';

@Module({
  imports: [TelegramModule, TypeOrmModule.forRootAsync({ useClass: DatabaseConfig }), ConfigModule.forRoot({
    isGlobal: true,
  }),UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
