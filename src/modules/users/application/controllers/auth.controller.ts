import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { AuthService } from "../../business/services/auth.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { LoginDto } from "../dto/login-user.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { GetUser } from "../decorators/get-user.decorator";
import type { IUser } from "../../business/entities/User";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  create(
    @Body() createDto: CreateUserDto,
  ) {
    return this.authService.create(createDto);
  }

  @Post('login')
  login(
    @Body() loginDto: LoginDto,
  ) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @Get('refresh')
  checkAuthStatus(
    @GetUser() user: IUser,
  ) {
    return this.authService.checkAuthStatus(user);
  }

  @Post('send-otp')
  sendOtp(
    @Body('phone') phone: string,
  ) {
    return this.authService.sendOtp(phone);
  }

  @Post('verify-otp')
  verifyOtp(
    @Body('phone') phone: string,
    @Body('code') code: string,
  ) {
    return this.authService.verifyOtp(phone, code);
  }
}