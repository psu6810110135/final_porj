import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm'; // 👈 สำคัญมาก
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ToursModule } from './tours/tours.module'; // 👈 สำคัญมาก

@Module({
  imports: [
    // 1. โหลด Config จาก .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 2. เชื่อมต่อ Database (แบบใช้ URL บรรทัดเดียวตาม .env ของคุณ)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'), // 👈 อ่านจาก DATABASE_URL ตรงๆ
        autoLoadEntities: true, // โหลด Entity อัตโนมัติ
        synchronize: true,      // สร้างตารางให้อัตโนมัติ (เฉพาะตอน Dev)
      }),
    }),

    // 3. ใส่ ToursModule เพื่อให้ App รู้จัก /tours
    ToursModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}