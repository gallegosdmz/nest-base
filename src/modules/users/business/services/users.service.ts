import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { UsersRepository } from "../repositories/users.repository";
import type { UsersValidator } from "../repositories/users.validator";
import { PaginationDto } from "src/shared/dtos/pagination.dto";
import { IUser } from "../entities/User";
import { IMeta } from "src/shared/interfaces/Meta";
import { UpdateUserDto } from "../../application/dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @Inject('UsersRepository')
    private readonly usersRepo: UsersRepository,

    @Inject('UsersValidator')
    private readonly usersValidator: UsersValidator,
  ) {}

  async findAll(paginationDto: PaginationDto): Promise<{ users: IUser[], meta: IMeta }> {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.usersRepo.findAll(limit, offset);
  }

  async findOne(id: string): Promise<IUser> {
    const user = await this.usersRepo.findOne(id);
    if (!user)
      throw new NotFoundException('User not found');

    return user;
  }

  async update(
    id: string,
    updateDto: UpdateUserDto,
    editor: IUser,
  ): Promise<IUser> {
    await this.usersValidator.validateOwnerToUserUpdate(id, editor);

    const { password, ...user } = updateDto;

    if (user.email)
      await this.usersValidator.validateEmailUniqueness(user.email, id);

    if (user.phone)
      await this.usersValidator.validatePhoneUniqueness(user.phone, id);

    const allowedFields: (keyof IUser)[] = ['firstName', 'lastName', 'email', 'phone'];

    const dataUpdate = Object.fromEntries(
      Object.entries(user).filter(([key, value]) =>
        allowedFields.includes(key as keyof IUser) && value !== undefined
      )
    ) as Partial<IUser>;

    return this.usersRepo.update(id, dataUpdate as IUser);
  }

  async remove(id: string, editor: IUser): Promise<{ message: string }> {
    await this.usersValidator.validateOwnerToUserUpdate(id, editor);
    return this.usersRepo.remove(id);
  }
}