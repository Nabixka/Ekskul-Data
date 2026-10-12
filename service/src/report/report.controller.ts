import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Request } from 'express';
import { AuthGuard } from '../auth/AuthGuard';
import { DriveListResponse, ReportService } from './report.service';

const MAX_REPORT_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/octet-stream',
]);
const ALLOWED_EXTENSIONS = new Set(['.doc', '.docx', '.xls', '.xlsx']);

@Controller('laporan')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('google-drive/oauth-url')
  @UseGuards(AuthGuard)
  getGoogleDriveOAuthUrl(
    @Req() request: Request & { user: { is_admin: boolean } },
  ) {
    return this.reportService.createGoogleDriveOAuthUrl(request.user);
  }

  @Get('google-drive/oauth-callback')
  googleDriveOAuthCallback(
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('error') error?: string,
  ) {
    return this.reportService.completeGoogleDriveOAuth(code, state, error);
  }

  @Post('upload/:ekskulId')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_REPORT_SIZE_BYTES },
      fileFilter: (_request, file, callback) => {
        const extension = file.originalname
          .split(/[\\/]/)
          .pop()
          ?.match(/\.[^.]+$/)?.[0]
          ?.toLowerCase();

        if (
          !extension ||
          !ALLOWED_EXTENSIONS.has(extension) ||
          !ALLOWED_MIME_TYPES.has(file.mimetype)
        ) {
          callback(
            new BadRequestException(
              'Format file harus Word (.doc, .docx) atau Excel (.xls, .xlsx)',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  uploadReport(
    @Req() request: Request & { user: { nis: number; is_admin: boolean } },
    @Param('ekskulId', ParseIntPipe) ekskulId: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File laporan wajib diunggah');
    }

    return this.reportService.uploadReport(request.user, ekskulId, file);
  }

  @Get('admin/years')
  @UseGuards(AuthGuard)
  getYears(
    @Req() request: Request & { user: { is_admin: boolean } },
  ): Promise<DriveListResponse> {
    return this.reportService.getYears(request.user);
  }

  @Get('admin/years/:year/months')
  @UseGuards(AuthGuard)
  getMonths(
    @Req() request: Request & { user: { is_admin: boolean } },
    @Param('year') year: string,
  ): Promise<DriveListResponse> {
    return this.reportService.getMonths(request.user, year);
  }

  @Get('admin/years/:year/months/:month/ekskul')
  @UseGuards(AuthGuard)
  getEkskulFolders(
    @Req() request: Request & { user: { is_admin: boolean } },
    @Param('year') year: string,
    @Param('month') month: string,
  ): Promise<DriveListResponse> {
    return this.reportService.getEkskulFolders(request.user, year, month);
  }

  @Get('admin/years/:year/months/:month/ekskul/:folderId/files')
  @UseGuards(AuthGuard)
  getFiles(
    @Req() request: Request & { user: { is_admin: boolean } },
    @Param('year') year: string,
    @Param('month') month: string,
    @Param('folderId') folderId: string,
  ): Promise<DriveListResponse> {
    return this.reportService.getFiles(request.user, year, month, folderId);
  }
}
