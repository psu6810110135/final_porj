import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  USER = 'user',
}

@Entity('users')
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  username!: string;

  @Column()
  password!: string;

  @Column({ unique: true, nullable: true })
  email!: string;

  @Column({ nullable: true })
  first_name!: string;

  @Column({ nullable: true })
  last_name!: string;

  @Column({ nullable: true })
  full_name!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  avatar_url!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  // ✨ Added is_active column to support suspending users
  @Column({ default: true })
  is_active!: boolean;

  @Column({ nullable: true })
  resetPasswordOtp!: string; // ไว้เก็บเลข 6 หลัก

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordOtpExpires!: Date; // ไว้เก็บเวลาหมดอายุของ OTP

  @Column({ nullable: true })
  resetPasswordToken!: string; // Token ลับที่ได้หลังยืนยัน OTP ผ่าน (เอาไว้อนุญาตให้เปลี่ยนรหัสได้)

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
