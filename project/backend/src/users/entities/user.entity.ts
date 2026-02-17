import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { UserProfile } from './user-profile.entity';

@Entity('users')
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ default: 'user' }) // 'admin' หรือ 'user'
  role: string;

  // เชื่อมกับ Profile (Cascade: true คือสร้าง User ปุ๊บ สร้าง Profile ให้ด้วยเลย)
  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  @JoinColumn()
  profile: UserProfile;

  @CreateDateColumn()
  createdAt: Date;
}