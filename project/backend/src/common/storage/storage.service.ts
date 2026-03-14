import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';

@Injectable()
export class StorageService {
  constructor(private readonly configService: ConfigService) {}

  usesLocalUploads(): boolean {
    return this.getStorageDriver() !== 's3';
  }

  getLocalUploadsRoot(): string {
    return join(process.cwd(), 'uploads');
  }

  async uploadPublicFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const normalizedFolder = folder.replace(/^\/+|\/+$/g, '');
    const fileName = this.createFileName(file);

    if (this.usesLocalUploads()) {
      return this.saveLocally(file, normalizedFolder, fileName);
    }

    return this.saveToS3(file, normalizedFolder, fileName);
  }

  private getStorageDriver(): string {
    return (
      this.configService.get<string>('STORAGE_DRIVER') ??
      this.configService.get<string>('FILE_STORAGE_DRIVER') ??
      'local'
    )
      .trim()
      .toLowerCase();
  }

  private createFileName(file: Express.Multer.File): string {
    const extension =
      extname(file.originalname || '').toLowerCase() ||
      this.inferExtension(file.mimetype);

    return `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
  }

  private inferExtension(mimeType?: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
    };

    return mimeToExt[(mimeType || '').toLowerCase()] ?? '';
  }

  private async saveLocally(
    file: Express.Multer.File,
    folder: string,
    fileName: string,
  ): Promise<string> {
    const targetDir = join(this.getLocalUploadsRoot(), folder);
    const targetPath = join(targetDir, fileName);

    await mkdir(targetDir, { recursive: true });
    await writeFile(targetPath, file.buffer);

    return `/uploads/${folder}/${fileName}`;
  }

  private async saveToS3(
    file: Express.Multer.File,
    folder: string,
    fileName: string,
  ): Promise<string> {
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    const region =
      this.configService.get<string>('AWS_REGION') ??
      this.configService.get<string>('AWS_DEFAULT_REGION');

    if (!bucket || !region) {
      throw new Error(
        'AWS_S3_BUCKET and AWS_REGION must be configured when STORAGE_DRIVER=s3',
      );
    }

    const keyPrefix = (
      this.configService.get<string>('AWS_S3_KEY_PREFIX') ?? ''
    ).replace(/^\/+|\/+$/g, '');
    const objectKey = [keyPrefix, folder, fileName].filter(Boolean).join('/');

    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    const s3Client = new S3Client({
      region,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    });

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype || undefined,
      }),
    );

    return this.buildPublicUrl(bucket, region, objectKey);
  }

  private buildPublicUrl(
    bucket: string,
    region: string,
    objectKey: string,
  ): string {
    const publicBaseUrl = (
      this.configService.get<string>('AWS_S3_PUBLIC_BASE_URL') ?? ''
    ).replace(/\/+$/g, '');

    if (publicBaseUrl) {
      return `${publicBaseUrl}/${objectKey}`;
    }

    return `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`;
  }
}
