import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { UsersRepository } from "../../business/repositories/users.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { IMeta } from "src/shared/interfaces/Meta";
import { IUser } from "../../business/entities/User";

@Injectable()
export class UsersRepositoryImpl implements UsersRepository {
  private readonly logger = new Logger(UsersRepositoryImpl.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(limit?: number, offset?: number): Promise<{ users: IUser[]; meta: IMeta; }> {
    try {
      const [users, total] = await this.userRepo.findAndCount({
        where: { isDeleted: false },
        take: limit,
        skip: offset,
      });

      return {
        users,
        meta: {
          total,
          limit: limit ?? 0,
          offset: offset ?? 0,
          totalPages: limit ? Math.ceil(total / limit) : 0,
        },
      }; 
    } catch (e) {
      this.logger.error('Error in find all - Users: ', e);
      throw new InternalServerErrorException('Error in Users Module');
    }
  }

  async findOne(id: string): Promise<IUser | null> {
    return this.userRepo.findOne({
      where: { id, isDeleted: false },
    });
  }

  async update(id: string, data: IUser): Promise<IUser> {
    const toUpdate = await this.userRepo.preload({
      id,
      ...data,
    });
    if (!toUpdate)
      throw new NotFoundException('This user is not register');

    try {
      await this.userRepo.save(toUpdate);
      return toUpdate;

    } catch (e) {
      this.logger.error('Error in update - Users: ', e);
      throw new InternalServerErrorException('Error in Users Module');
    }
  }

  async verifyPhone(phone: string): Promise<void> {
    try {
      await this.userRepo.update({ phone }, { isPhoneVerified: true });

    } catch (e) {
      this.logger.error('Error in verify phone - Users: ', e);
      throw new InternalServerErrorException('Error in Users Module');
    }
  }

  async remove(id: string): Promise<{ message: string; }> {
    const user = await this.findOne(id)
    if (!user)
      throw new NotFoundException('User not found');

    try {
      await this.userRepo.update(id, { isDeleted: true });
      return { message: 'This user is removed successfully' };

    } catch (e) {
      this.logger.error('Error in remove - Users: ', e);
      throw new InternalServerErrorException('Error in Users Module');
    }
  }

}