import { JwtService } from '@nestjs/jwt';

export function generateTestToken(
  userId: string,
  username: string,
  role: string,
): string {
  const jwtService = new JwtService({
    secret: process.env.JWT_SECRET || 'YOUR_SECRET_KEY',
    signOptions: { expiresIn: '3d' },
  });

  const payload = {
    username,
    role,
    sub: userId,
  };

  return jwtService.sign(payload);
}
