import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OtpRepository } from "../../business/repositories/otp.repository";
import { Twilio } from "twilio";

@Injectable()
export class OtpRepositoryImpl implements OtpRepository {
  private readonly client: Twilio;
  private readonly serviceSid: string;
  private readonly logger = new Logger(OtpRepositoryImpl.name);

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.getOrThrow<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.getOrThrow<string>('TWILIO_AUTH_TOKEN');
    
    this.serviceSid = this.configService.getOrThrow<string>('TWILIO_VERIFY_SERVICE_SID');
    this.client = new Twilio(accountSid, authToken);
  }

  async sendOtp(phone: string): Promise<{ message: string; }> {
    try {
      await this.client.verify.v2
        .services(this.serviceSid)
        .verifications.create({
          to: phone,
          channel: 'sms',
        });

      return { message: 'Verification code is send' };
    } catch (e) {
      this.logger.error(`Error in send otp to: ${phone}: ${e}`);
      throw new InternalServerErrorException('Error in OTP Repository');
    }
  }

  async verifyOtp(phone: string, code: string): Promise<{ verified: boolean; }> {
    try {
      const verification = await this.client.verify.v2
        .services(this.serviceSid)
        .verificationChecks.create({
          to: phone,
          code,
        });

        if (verification.status !== 'approved')
          throw new BadRequestException('Verification code invalid or expired');

        return { verified: true };
        
    } catch (e) {
      this.logger.error(`Error in verify OTP to: ${phone}: ${e}`);
      throw new InternalServerErrorException('Error int OTP Repository')
    }
  }
  
}