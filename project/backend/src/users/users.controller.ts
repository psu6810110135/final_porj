import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { StorageService } from '../common/storage/storage.service';

@Controller('api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
  ) {}

  private ensureAdmin(req: any) {
    if (req.user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('เฉพาะผู้ดูแลระบบเท่านั้นที่เข้าถึงได้');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req, @Body() createUserDto: CreateUserDto) {
    this.ensureAdmin(req);
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Request() req) {
    this.ensureAdmin(req);
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Request() req) {
    return this.usersService.getCurrentUserProfile(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  updateMe(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateCurrentUserProfile(
      req.user.id,
      updateProfileDto,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      fileFilter: (_, file, callback) => {
        const mimeType = (file.mimetype || '').toLowerCase();
        const extension = extname(file.originalname || '').toLowerCase();
        const allowedMimeTypes = [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/pjpeg',
        ];
        const allowedExtensions = ['.png', '.jpg', '.jpeg'];

        const isAllowedType =
          allowedMimeTypes.includes(mimeType) &&
          allowedExtensions.includes(extension);

        if (!isAllowedType) {
          return callback(
            new BadRequestException(
              'รองรับเฉพาะไฟล์ PNG, JPG หรือ JPEG เท่านั้น',
            ),
            false,
          );
        }

        callback(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  uploadAvatar(
    @Request() req,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 2 * 1024 * 1024,
          message: 'รูปโปรไฟล์ต้องมีขนาดไม่เกิน 2MB',
        })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: 400,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.storageService
      .uploadPublicFile(file, 'avatars')
      .then((avatarUrl) =>
        this.usersService.updateAvatar(req.user.id, avatarUrl),
      );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    this.ensureAdmin(req);
    return this.usersService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    this.ensureAdmin(req);
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    this.ensureAdmin(req);
    return this.usersService.remove(id);
  }
}
