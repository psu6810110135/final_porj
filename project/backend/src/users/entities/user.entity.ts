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

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  USER = 'user',
}

@Entity('users')
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true, nullable: true })
  @JoinColumn()
  profile: UserProfile;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  full_name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  // ✨ Added is_active column to support suspending users
  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}