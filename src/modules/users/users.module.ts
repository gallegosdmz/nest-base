import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from './external-system/entities/user.entity';

import { AuthController } from './application/controllers/auth.controller';
import { UsersController } from './application/controllers/users.controller';

import { AuthService } from './business/services/auth.service';
import { UsersService } from './business/services/users.service';

import { AuthRepositoryImpl } from './external-system/repositories/auth.repository.impl';
import { UsersRepositoryImpl } from './external-system/repositories/users.repository.impl';
import { UsersValidatorImpl } from './external-system/repositories/users.validator.impl';
import { OtpRepositoryImpl } from './external-system/repositories/otp.repository.impl';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [
    AuthService,
    UsersService,
    { provide: 'AuthRepository', useClass: AuthRepositoryImpl },
    { provide: 'UsersRepository', useClass: UsersRepositoryImpl },
    { provide: 'UsersValidator', useClass: UsersValidatorImpl },
    { provide: 'OtpRepository', useClass: OtpRepositoryImpl },
  ],
  exports: [JwtModule, PassportModule, UsersService],
})
export class UsersModule {}
