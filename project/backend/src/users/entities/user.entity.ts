import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  OneToOne, 
  JoinColumn, 
  Unique 
} from 'typeorm';
import { UserProfile } from './user-profile.entity';

// ใช้ Enum จากฝั่ง dev เพื่อความเป๊ะของข้อมูล
export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  USER = 'user', // ผมแถม role 'user' ให้เผื่อระบบ Auth ของคุณเช็คค่านี้
}

@Entity('users')
@Unique(['username']) // บังคับไม่ให้ username ซ้ำ (จากฝั่ง Auth)
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ==========================================
  // 🟢 ข้อมูลสำหรับระบบ Auth (จาก login+register)
  // ==========================================
  @Column()
  username: string;

  @Column()
  password: string; // ใช้ชื่อ password ตามระบบ Auth จะได้ไม่ต้องแก้เยอะ

  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  @JoinColumn()
  profile: UserProfile;

  // ==========================================
  // 🟡 ข้อมูลทั่วไป (จาก dev)
  // ==========================================
  @Column({ unique: true, nullable: true })
  email: string; // nullable: true เพื่อให้ตอนสมัครสมาชิกใหม่ไม่พังถ้ายังไม่ได้กรอก

  @Column({ nullable: true })
  full_name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER, // ตั้งค่าเริ่มต้นเป็น user
  })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}