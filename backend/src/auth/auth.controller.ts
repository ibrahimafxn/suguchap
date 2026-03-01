import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { OtpRequestDto } from './dto/otp-request.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('otp/request')
  requestOtp(@Body() dto: OtpRequestDto) {
    const result = this.authService.requestOtp(dto.phone);
    const isProd = this.configService.get('NODE_ENV') === 'production';
    if (isProd) {
      return { success: true };
    }
    return result;
  }

  @Post('otp/verify')
  verifyOtp(@Body() dto: OtpVerifyDto) {
    return this.authService.verifyOtp(dto.phone, dto.code);
  }
}
