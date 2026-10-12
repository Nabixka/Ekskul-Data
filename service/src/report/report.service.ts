import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { drive_v3, google } from 'googleapis';
import { randomBytes } from 'crypto';
import { Readable } from 'stream';
import { DatabaseService } from '../database/database.service';
import { RoleService } from '../role/role.service';

const REPORTS_ROOT_NAME = 'Pelaporan Data Bulanan Ekskul';
const DRIVE_FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
const MANAGEMENT_ROLES = [
  'Ketua',
  'Wakil Ketua',
  'Sekretaris',
  'Bendahara',
  'Humas',
];
const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];
const DRIVE_OAUTH_SCOPE = 'https://www.googleapis.com/auth/drive';
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

interface ReportUser {
  nis: number;
  is_admin: boolean;
}

export interface DriveListItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string | null;
  webViewLink?: string | null;
  size?: string | null;
}

export interface DriveListResponse {
  message: string;
  data: DriveListItem[];
}

@Injectable()
export class ReportService {
  private driveClient?: drive_v3.Drive;
  private readonly oauthStates = new Map<string, number>();

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly roleService: RoleService,
  ) {}

  createGoogleDriveOAuthUrl(user: Pick<ReportUser, 'is_admin'>) {
    this.assertAdmin(user);
    const oauthClient = this.getOAuthClient(true);
    const state = randomBytes(32).toString('hex');
    this.oauthStates.set(state, Date.now() + OAUTH_STATE_TTL_MS);
    this.removeExpiredOAuthStates();

    return {
      message: 'Buka URL untuk memberikan izin akses Google Drive',
      data: {
        authorizationUrl: oauthClient.generateAuthUrl({
          access_type: 'offline',
          prompt: 'consent',
          scope: [DRIVE_OAUTH_SCOPE],
          state,
        }),
      },
    };
  }

  async completeGoogleDriveOAuth(
    code?: string,
    state?: string,
    oauthError?: string,
  ) {
    if (oauthError) {
      throw new BadRequestException(
        `Persetujuan Google Drive dibatalkan atau ditolak: ${oauthError}`,
      );
    }
    if (!code || !state) {
      throw new BadRequestException(
        'Callback OAuth membutuhkan parameter code dan state',
      );
    }

    const expiresAt = this.oauthStates.get(state);
    this.oauthStates.delete(state);
    if (!expiresAt || expiresAt < Date.now()) {
      throw new BadRequestException(
        'State OAuth tidak valid atau kedaluwarsa. Mulai ulang proses otorisasi.',
      );
    }

    const { tokens } = await this.getOAuthClient(true).getToken(code);
    if (!tokens.refresh_token) {
      throw new BadRequestException(
        'Google tidak mengembalikan refresh_token. Cabut akses aplikasi ini dari Google Account lalu mulai ulang dengan persetujuan baru.',
      );
    }

    return {
      message:
        'Refresh token berhasil dibuat. Simpan sebagai GOOGLE_REFRESH_TOKEN di file .env backend, lalu restart service.',
      data: {
        refresh_token: tokens.refresh_token,
      },
    };
  }

  async uploadReport(
    user: ReportUser,
    ekskulId: number,
    file: Express.Multer.File,
  ) {
    if (user.is_admin !== false) {
      throw new ForbiddenException('Hanya pengurus ekskul yang dapat mengunggah laporan');
    }

    const role = await this.roleService.getRole(user.nis, ekskulId);
    if (!role || !MANAGEMENT_ROLES.includes(role)) {
      throw new ForbiddenException('Hanya pengurus ekskul yang dapat mengunggah laporan');
    }

    const ekskul = await this.databaseService
      .connection('ekskul')
      .select('name')
      .where({ id: ekskulId })
      .first();

    if (!ekskul) {
      throw new NotFoundException('Ekstrakurikuler tidak ditemukan');
    }

    const originalName = file.originalname
      .replace(/\\/g, '/')
      .split('/')
      .pop()
      ?.trim();
    if (!originalName) {
      throw new BadRequestException('Nama file tidak valid');
    }

    const period = this.getCurrentJakartaPeriod();
    const folderId = await this.ensureReportFolder(ekskul.name, period);
    const response = await this.getDrive().files.create({
      requestBody: {
        name: originalName,
        mimeType: file.mimetype,
        parents: [folderId],
      },
      media: {
        mimeType: file.mimetype,
        body: Readable.from([file.buffer]),
      },
      fields: 'id,name,mimeType,size,modifiedTime,webViewLink',
      supportsAllDrives: true,
    });

    const uploadedFile = this.toDriveListItem(response.data);
    if (!uploadedFile) {
      throw new InternalServerErrorException(
        'Google Drive tidak mengembalikan informasi file yang diunggah',
      );
    }

    return {
      message: 'Laporan berhasil diunggah',
      data: {
        ...uploadedFile,
        ekskul: ekskul.name,
        year: period.year,
        month: period.month,
      },
    };
  }

  async getYears(
    user: Pick<ReportUser, 'is_admin'>,
  ): Promise<DriveListResponse> {
    this.assertAdmin(user);
    const rootId = await this.findReportsRoot();
    return {
      message: 'Berhasil mendapatkan daftar tahun laporan',
      data: rootId ? await this.listFolders(rootId) : [],
    };
  }

  async getMonths(
    user: Pick<ReportUser, 'is_admin'>,
    year: string,
  ): Promise<DriveListResponse> {
    this.assertAdmin(user);
    this.validateYear(year);
    const yearFolderId = await this.resolveReportPath([year]);
    return {
      message: 'Berhasil mendapatkan daftar bulan laporan',
      data: yearFolderId ? await this.listFolders(yearFolderId) : [],
    };
  }

  async getEkskulFolders(
    user: Pick<ReportUser, 'is_admin'>,
    year: string,
    month: string,
  ): Promise<DriveListResponse> {
    this.assertAdmin(user);
    this.validateYear(year);
    this.validateMonth(month);
    const monthFolderId = await this.resolveReportPath([year, month]);
    return {
      message: 'Berhasil mendapatkan daftar folder ekstrakurikuler',
      data: monthFolderId ? await this.listFolders(monthFolderId) : [],
    };
  }

  async getFiles(
    user: Pick<ReportUser, 'is_admin'>,
    year: string,
    month: string,
    folderId: string,
  ): Promise<DriveListResponse> {
    this.assertAdmin(user);
    this.validateYear(year);
    this.validateMonth(month);

    const monthFolderId = await this.resolveReportPath([year, month]);
    if (!monthFolderId) {
      throw new NotFoundException('Folder tahun atau bulan tidak ditemukan');
    }

    const folders = await this.listFolders(monthFolderId);
    if (!folders.some((folder) => folder.id === folderId)) {
      throw new NotFoundException('Folder ekstrakurikuler tidak ditemukan');
    }

    return {
      message: 'Berhasil mendapatkan daftar file laporan',
      data: await this.listFiles(folderId),
    };
  }

  private getDrive(): drive_v3.Drive {
    if (this.driveClient) return this.driveClient;

    const requiredVariables = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REFRESH_TOKEN',
      'GOOGLE_DRIVE_PARENT_FOLDER_ID',
    ];
    const missingVariables = requiredVariables.filter(
      (name) => !process.env[name],
    );
    if (missingVariables.length > 0) {
      throw new InternalServerErrorException(
        `Konfigurasi Google Drive belum lengkap: ${missingVariables.join(', ')}`,
      );
    }

    const auth = this.getOAuthClient();
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    this.driveClient = google.drive({ version: 'v3', auth });
    return this.driveClient;
  }

  private getOAuthClient(requireRedirectUri = false) {
    const missingVariables = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      ...(requireRedirectUri ? ['GOOGLE_OAUTH_REDIRECT_URI'] : []),
    ].filter((name) => !process.env[name]);
    if (missingVariables.length > 0) {
      throw new InternalServerErrorException(
        `Konfigurasi OAuth Google belum lengkap: ${missingVariables.join(', ')}`,
      );
    }

    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URI,
    );
  }

  private getCurrentJakartaPeriod() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: 'numeric',
    }).formatToParts(new Date());
    const year = parts.find((part) => part.type === 'year')?.value;
    const monthNumber = Number(
      parts.find((part) => part.type === 'month')?.value,
    );
    const monthName = MONTH_NAMES[monthNumber - 1];

    if (!year || !monthName) {
      throw new InternalServerErrorException(
        'Tidak dapat menentukan periode laporan saat ini',
      );
    }

    return { year, month: monthName };
  }

  private async ensureReportFolder(
    ekskulName: string,
    period: { year: string; month: string },
  ) {
    const parentId = this.getParentFolderId();

    const rootId = await this.ensureFolder(REPORTS_ROOT_NAME, parentId);
    const yearId = await this.ensureFolder(period.year, rootId);
    const monthId = await this.ensureFolder(period.month, yearId);
    return this.ensureFolder(ekskulName, monthId);
  }

  private async findReportsRoot() {
    const parentId = this.getParentFolderId();
    return this.findFolder(REPORTS_ROOT_NAME, parentId);
  }

  private getParentFolderId() {
    const configuredValue = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID?.trim();
    if (!configuredValue) {
      throw new InternalServerErrorException(
        'Konfigurasi GOOGLE_DRIVE_PARENT_FOLDER_ID belum diatur',
      );
    }

    if (!configuredValue.includes('://')) return configuredValue;

    try {
      const folderUrl = new URL(configuredValue);
      const folderId =
        folderUrl.pathname.match(/\/folders\/([^/]+)/)?.[1] ??
        folderUrl.searchParams.get('id');
      if (
        !['drive.google.com', 'www.google.com'].includes(folderUrl.hostname) ||
        !folderId
      ) {
        throw new Error('URL folder Google Drive tidak valid');
      }
      return folderId;
    } catch {
      throw new InternalServerErrorException(
        'GOOGLE_DRIVE_PARENT_FOLDER_ID harus berupa ID folder atau URL folder Google Drive yang valid',
      );
    }
  }

  private async resolveReportPath(names: string[]) {
    let parentId = await this.findReportsRoot();
    if (!parentId) return undefined;

    for (const name of names) {
      parentId = await this.findFolder(name, parentId);
      if (!parentId) return undefined;
    }
    return parentId;
  }

  private async ensureFolder(name: string, parentId: string) {
    const existingId = await this.findFolder(name, parentId);
    if (existingId) return existingId;

    const response = await this.getDrive().files.create({
      requestBody: {
        name,
        mimeType: DRIVE_FOLDER_MIME_TYPE,
        parents: [parentId],
      },
      fields: 'id',
      supportsAllDrives: true,
    });
    if (!response.data.id) {
      throw new InternalServerErrorException(
        `Google Drive tidak mengembalikan ID folder "${name}"`,
      );
    }
    return response.data.id;
  }

  private async findFolder(name: string, parentId: string) {
    const escapedName = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const response = await this.getDrive().files.list({
      q: [
        `'${parentId}' in parents`,
        `name = '${escapedName}'`,
        `mimeType = '${DRIVE_FOLDER_MIME_TYPE}'`,
        'trashed = false',
      ].join(' and '),
      pageSize: 1,
      fields: 'files(id)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    return response.data.files?.[0]?.id ?? undefined;
  }

  private async listFolders(parentId: string): Promise<DriveListItem[]> {
    return this.listChildren(parentId, true);
  }

  private async listFiles(parentId: string): Promise<DriveListItem[]> {
    return this.listChildren(parentId, false);
  }

  private async listChildren(
    parentId: string,
    foldersOnly: boolean,
  ): Promise<DriveListItem[]> {
    const query = [
      `'${parentId}' in parents`,
      foldersOnly
        ? `mimeType = '${DRIVE_FOLDER_MIME_TYPE}'`
        : `mimeType != '${DRIVE_FOLDER_MIME_TYPE}'`,
      'trashed = false',
    ].join(' and ');
    const items: DriveListItem[] = [];
    let pageToken: string | undefined;

    do {
      const response = await this.getDrive().files.list({
        q: query,
        pageSize: 1000,
        pageToken,
        orderBy: 'name',
        fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink,size)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      for (const file of response.data.files ?? []) {
        const item = this.toDriveListItem(file);
        if (item) items.push(item);
      }
      pageToken = response.data.nextPageToken ?? undefined;
    } while (pageToken);

    return items;
  }

  private toDriveListItem(
    file: drive_v3.Schema$File,
  ): DriveListItem | undefined {
    if (!file.id || !file.name) return undefined;
    return {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType ?? '',
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink,
      size: file.size,
    };
  }

  private validateYear(year: string) {
    if (!/^\d{4}$/.test(year)) {
      throw new BadRequestException('Tahun harus berformat YYYY');
    }
  }

  private validateMonth(month: string) {
    if (!MONTH_NAMES.includes(month)) {
      throw new BadRequestException('Nama bulan tidak valid');
    }
  }

  private assertAdmin(user: Pick<ReportUser, 'is_admin'>) {
    if (user.is_admin !== true) {
      throw new ForbiddenException('Hanya admin yang dapat menelusuri laporan');
    }
  }

  private removeExpiredOAuthStates() {
    const now = Date.now();
    for (const [state, expiresAt] of this.oauthStates) {
      if (expiresAt < now) this.oauthStates.delete(state);
    }
  }
}
