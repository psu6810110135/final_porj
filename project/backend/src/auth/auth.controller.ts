import { Controller, Post, Body, ValidationPipe, HttpCode, HttpStatus, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // ปล่อยว่างไว้ได้เลย NestJS จะพาไปหน้า Google อัตโนมัติ
  }
  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    // สร้าง Token จากข้อมูล Google
    const jwt = await this.authService.googleLogin(req);
    
    // ดีดกลับไปที่หน้าบ้าน (React) พร้อมแนบ Token ไปที่ URL
    // *ตรง 5173 ให้เปลี่ยนเป็น Port ที่ React ของคุณรันอยู่นะครับ*
    res.redirect(`http://localhost:5173/login/success?token=${jwt.accessToken}`); 
  }
  @Post('/signup')
  signUp(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.authService.signUp(authCredentialsDto);
  }
  
  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  signIn(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDto);
  }

  // Endpoint แถม: เอาไว้เทสต์ว่า Token ใช้งานได้จริงไหม
  @Get('/profile')
  @UseGuards(AuthGuard())
  getProfile(@Req() req) {
    return req.user;
  }
}