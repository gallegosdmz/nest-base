import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { AuthRepository } from "../../business/repositories/auth.repository";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { IAuth } from "../../business/entities/Auth";
import { IUser } from "../../business/entities/User";
import { JwtPayload } from "src/shared/interfaces/Jwt-payload.interface";

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthRepositoryImpl implements AuthRepository {
  private readonly logger = new Logger(AuthRepositoryImpl.name);
  
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async create(data: IUser): Promise<IAuth> {
    try {
      const res = this.userRepo.create(data);
      await this.userRepo.save(res);

      return {
        firstName: res.firstName,
        lastName: res.lastName,
        email: res.email ?? null,
        phone: res.phone,
        isVerified: res.isVerified,
        isPhoneVerified: res.isPhoneVerified,
        token: this.getJwtToken({ id: res.id }),
      };

    } catch (e) {
      this.logger.error(`Error in create - auth: ${e}`);
      throw new InternalServerErrorException('Internal sever error in Auth Repository');
    }
  }

  async login(email: string, password: string): Promise<IAuth> {
    const user = await this.userRepo.findOne({
      where: { email },
      select: {
        id: true,
        firstName: true, 
        lastName: true,
        phone: true,
        email: true,
        password: true,
        isVerified: true,
        isPhoneVerified: true,
      },
    });

    if (!user) 
      throw new UnauthorizedException('Email not found');

    if (user.isDeleted)
      throw new NotFoundException('User not found');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Incorrect password');

    const { password: _, ...data } = user;

    return {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email ?? null,
      phone: data.phone,
      isVerified: data.isVerified,
      isPhoneVerified: data.isPhoneVerified,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async checkAuthStatus(user: IUser): Promise<IAuth> {
    if (!user.id)
      throw new BadRequestException('User id is required');

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  getJwtToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
}