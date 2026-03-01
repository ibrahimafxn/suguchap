import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface OtpEntry {
  code: string;
  expiresAt: number;
}

@Injectable()
export class OtpService {
  private readonly store = new Map<string, OtpEntry>();
  private readonly ttlMinutes: number;
  private readonly fixedCode: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.ttlMinutes = Number(this.configService.get('OTP_TTL_MINUTES') ?? 5);
    this.fixedCode = this.configService.get<string>('OTP_FIXED_CODE');
  }

  generate(phone: string): string {
    const code = this.fixedCode ?? this.randomCode();
    const expiresAt = Date.now() + this.ttlMinutes * 60 * 1000;
    this.store.set(phone, { code, expiresAt });
    return code;
  }

  verify(phone: string, code: string): boolean {
    const entry = this.store.get(phone);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(phone);
      return false;
    }
    const ok = entry.code === code;
    if (ok) {
      this.store.delete(phone);
    }
    return ok;
  }

  private randomCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }
}
