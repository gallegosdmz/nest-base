import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { AuthRepository } from "../repositories/auth.repository";
import type { UsersValidator } from "../repositories/users.validator";
import type { OtpRepository } from "../repositories/otp.repository";
import type { UsersRepository } from "../repositories/users.repository";
import { CreateUserDto } from "../../application/dto/create-user.dto";
import * as bcrypt from 'bcrypt';
import { IAuth } from "../entities/Auth";
import { LoginDto } from "../../application/dto/login-user.dto";
import { IUser } from "../entities/User";

@Injectable()
export class AuthService {
  constructor(
    @Inject('AuthRepository')
    private readonly authRepo: AuthRepository,

    @Inject('UsersValidator')
    private readonly usersValidator: UsersValidator,

    @Inject('OtpRepository')
    private readonly otpRepo: OtpRepository,

    @Inject('UsersRepository')
    private readonly usersRepo: UsersRepository,
  ) {}

  async create(createDto: CreateUserDto): Promise<IAuth> {
    const { password, ...data } = createDto;
    
    if (data.phone)
      await this.usersValidator.validatePhoneUniqueness(data.phone);

    await this.usersValidator.validateEmailUniqueness(data.email);
    return this.authRepo.create({ ...data, password: bcrypt.hashSync(password, 10) });
  }

  async login(loginDto: LoginDto): Promise<IAuth> {
    const { email, password } = loginDto;
    return this.authRepo.login(email, password);
  }

  async checkAuthStatus(user: IUser): Promise<IAuth> {
    if (!user)
      throw new BadRequestException('User is required');
    
    return this.authRepo.checkAuthStatus(user);
  }

  async sendOtp(phone: string): Promise<{ message: string }> {
    return this.otpRepo.sendOtp(phone);
  }

  async verifyOtp(phone: string, code: string): Promise<{ message: string }> {
    const { verified } = await this.otpRepo.verifyOtp(phone, code);

    if (!verified)
      throw new BadRequestException('Code verification invalid');

    await this.usersRepo.verifyPhone(phone);
    return { message: 'Verify phone successfully' };
  }
}