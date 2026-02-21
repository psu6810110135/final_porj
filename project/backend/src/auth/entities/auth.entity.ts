import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('users') // ชื่อตารางใน Database
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string; // เก็บแบบ Hash

  @CreateDateColumn()
  createdAt: Date;
}