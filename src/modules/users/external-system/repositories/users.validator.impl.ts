import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersValidator } from "../../business/repositories/users.validator";
import { User } from "../entities/user.entity";
import { FindOperator, Not, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { IUser } from "../../business/entities/User";

type IWhereCondition = {
  [K in keyof User]?: User[K] | FindOperator<NonNullable<User[K]>>;
} & {
  isDeleted: boolean;
};

@Injectable()
export class UsersValidatorImpl implements UsersValidator {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async validateEmailUniqueness(email: string, userId?: string): Promise<boolean> {
    return this.validateFieldUserUniquenes(
      'email',
      email,
      userId,
      'correo electrónico',
    );
  }

  async validatePhoneUniqueness(phone: string, userId?: string): Promise<boolean> {
    return this.validateFieldUserUniquenes('phone', phone, userId, 'teléfono');
  }

  async validateOwnerToUserUpdate(toUpdateId: string, userEditor: IUser): Promise<boolean> {
    if (toUpdateId !== userEditor.id)
      throw new UnauthorizedException('Unauthorized to edit this user');

    return true;
  }

  private async validateFieldUserUniquenes(
    field: keyof User,
    value: string | number,
    userId?: string,
    fieldName?: string,
  ): Promise<boolean> {
    const whereCondition: IWhereCondition = {
      [field]: value,
      isDeleted: false,
    };

    if (userId) whereCondition.id = Not(userId);

    const user = await this.userRepo.findOne({
      where: whereCondition,
    });

    if (user) {
      const displayName = fieldName || field;
      throw new BadRequestException(`El ${displayName} ya está registrado`);
    }

    return false;
  }
}