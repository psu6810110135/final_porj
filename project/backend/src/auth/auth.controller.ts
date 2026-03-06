//auth.controller.ts
import { Controller, Post, Body, ValidationPipe, BadRequestException, HttpCode, HttpStatus, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }
  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // ปล่อยว่างไว้ได้เลย NestJS จะพาไปหน้า Google อัตโนมัติ
  }
  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const result = await this.authService.googleLogin(req);

    // ถ้า email นี้มีบัญชีปกติอยู่แล้ว → redirect กลับพร้อม error
    if ('conflict' in result) {
      return res.redirect('http://localhost:5173/login?error=email_exists');
    }

    res.redirect(`http://localhost:5173/login/success?token=${result.accessToken}`);
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
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    try {
      return await this.authService.forgotPassword(body.email);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    try {
      return await this.authService.verifyOtp(body.email, body.otp);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('reset-password')
  async resetPasswordWithToken(@Body() body: { email: string; resetToken: string; newPassword: string }) {
    try {
      return await this.authService.resetPasswordWithToken(body.email, body.resetToken, body.newPassword);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}