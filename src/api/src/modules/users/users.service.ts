import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(data: Partial<User>): Promise<User> {
    // Hash password if provided and not already hashed
    if (data.password && !data.password.startsWith('$2')) {
      data.password = await bcrypt.hash(data.password, this.SALT_ROUNDS);
    }
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    // Hash password if provided and not already hashed
    if (data.password && !data.password.startsWith('$2')) {
      data.password = await bcrypt.hash(data.password, this.SALT_ROUNDS);
    }
    await this.userRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async validatePassword(userId: string, password: string): Promise<boolean> {
    const user = await this.findOne(userId);
    return bcrypt.compare(password, user.password);
  }

  async changePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    await this.userRepository.update(userId, { password: hashedPassword });
  }
}
