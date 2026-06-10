import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OtpRepository } from "../../business/repositories/otp.repository";
import { Twilio } from "twilio";

@Injectable()
export class OtpRepositoryImpl implements OtpRepository {
  private client?: Twilio;
  private serviceSid?: string;
  private readonly logger = new Logger(OtpRepositoryImpl.name);

  constructor(private readonly configService: ConfigService) {}

  private getClient(): { client: Twilio; serviceSid: string } {
    if (this.client && this.serviceSid)
      return { client: this.client, serviceSid: this.serviceSid };

    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const serviceSid = this.configService.get<string>('TWILIO_VERIFY_SERVICE_SID');

    if (!accountSid || !authToken || !serviceSid)
      throw new InternalServerErrorException('OTP feature is not configured (missing TWILIO_* env vars)');

    this.client = new Twilio(accountSid, authToken);
    this.serviceSid = serviceSid;

    return { client: this.client, serviceSid: this.serviceSid };
  }

  async sendOtp(phone: string): Promise<{ message: string; }> {
    try {
      const { client, serviceSid } = this.getClient();
      await client.verify.v2
        .services(serviceSid)
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
      const { client, serviceSid } = this.getClient();
      const verification = await client.verify.v2
        .services(serviceSid)
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