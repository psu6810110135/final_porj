import { JwtService } from '@nestjs/jwt';

export function generateTestToken(userId: string, username: string, role: string): string {
  const jwtService = new JwtService({
    secret: 'YOUR_SECRET_KEY', // Must match auth.module.ts
    signOptions: { expiresIn: '3d' },
  });

  const payload = {
    username,
    role,
    sub: userId,
  };

  return jwtService.sign(payload);
}
