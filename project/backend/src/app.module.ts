// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ให้ทุก Module เรียกใช้ .env ได้
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    type: 'postgres',
    // --- ลองใส่ค่าตรงๆ แทน configService.get() ---
    host: 'localhost', 
    port: 5432, // หรือลองเปลี่ยนเป็น 5432 ตรงนี้
    username: 'thai_tours',
    password: 'thai_tours_password', // ใส่รหัสผ่านให้ตรงกับที่คุณตั้งใน DB
    database: 'thai_tours',
    // -------------------------------------------
    autoLoadEntities: true,
    synchronize: true,
  }),
}),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}