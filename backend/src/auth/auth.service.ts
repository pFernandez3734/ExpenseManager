import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    const uid = (user._id as { toString(): string }).toString();
    const tokens = await this.generateTokens(uid, user.email);
    await this.usersService.setRefreshToken(uid, tokens.refreshToken);
    return { user: { id: uid, email: user.email, name: user.name }, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const uid = (user._id as { toString(): string }).toString();
    const tokens = await this.generateTokens(uid, user.email);
    await this.usersService.setRefreshToken(uid, tokens.refreshToken);
    return { user: { id: uid, email: user.email, name: user.name }, ...tokens };
  }

  async refresh(userId: string, email: string, refreshToken: string) {
    const valid = await this.usersService.validateRefreshToken(userId, refreshToken);
    if (!valid) throw new UnauthorizedException('Refresh token inválido');

    const tokens = await this.generateTokens(userId, email);
    await this.usersService.setRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.setRefreshToken(userId, null);
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('jwt.secret'),
        expiresIn: this.config.get('jwt.expiresIn') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get('jwt.refreshExpiresIn') as any,
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
