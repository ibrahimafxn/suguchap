import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OtpService } from './otp.service';
import { UserDocument } from '../users/user.schema';
import { SignupDto } from './dto/signup.dto';
import { UserRole } from '../common/types/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly otpService: OtpService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  requestOtp(phone: string): { success: true; code?: string } {
    const code = this.otpService.generate(phone);
    return { success: true, code };
  }

  async verifyOtp(phone: string, code: string): Promise<{ token: string; user: UserDocument }> {
    const valid = this.otpService.verify(phone, code);
    if (!valid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const user = await this.usersService.findOrCreateByPhone(phone);
    const token = await this.jwtService.signAsync({
      sub: user.id ?? user._id.toString(),
      phone: user.phone,
      role: user.role,
    });

    return { token, user };
  }

  async signup(dto: SignupDto): Promise<{ token: string; user: UserDocument }> {
    if (dto.role === UserRole.ADMIN) {
      throw new BadRequestException('Admin signup is not allowed');
    }
    const user = await this.usersService.createUser({
      phone: dto.phone,
      name: dto.name,
      city: dto.city,
      address: dto.address,
      role: dto.role,
    });

    const token = await this.jwtService.signAsync({
      sub: user.id ?? user._id.toString(),
      phone: user.phone,
      role: user.role,
    });

    return { token, user };
  }
}
