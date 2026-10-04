import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from 'src/auth/AuthGuard';
import { ValidateEkskulExist } from 'src/Pipe/validateEkskulExist';
import { KasService } from './kas.service';

@Controller('kas')
@UseGuards(AuthGuard)
export class KasController {
  constructor(private readonly kasService: KasService) {}

  @Get('/ekskul/:ekskul_id')
  getKas(
    @Request() req,
    @Param('ekskul_id', ValidateEkskulExist) ekskulId: string,
    @Query('bulan') month?: string,
    @Query('tahun') year?: string
  ) {
    return this.kasService.getKas(req.user, Number(ekskulId), month, year)
  }

  @Post('/ekskul/:ekskul_id')
  createTransaction(
    @Request() req,
    @Param('ekskul_id', ValidateEkskulExist) ekskulId: string,
    @Body() body: {
      amount: number,
      jenis: 'masuk' | 'keluar',
      keterangan: string,
      waktu: string,
      member_ekskul_id?: number | null
    }
  ) {
    return this.kasService.createTransaction(req.user, Number(ekskulId), body)
  }

  @Put('/ekskul/:ekskul_id/:transaction_id')
  updateTransaction(
    @Request() req,
    @Param('ekskul_id', ValidateEkskulExist) ekskulId: string,
    @Param('transaction_id') transactionId: string,
    @Body() body: {
      amount: number,
      jenis: 'masuk' | 'keluar',
      keterangan: string,
      waktu: string,
      member_ekskul_id?: number | null
    }
  ) {
    return this.kasService.updateTransaction(req.user, Number(ekskulId), Number(transactionId), body)
  }

  @Delete('/ekskul/:ekskul_id/:transaction_id')
  deleteTransaction(
    @Request() req,
    @Param('ekskul_id', ValidateEkskulExist) ekskulId: string,
    @Param('transaction_id') transactionId: string
  ) {
    return this.kasService.deleteTransaction(req.user, Number(ekskulId), Number(transactionId))
  }

  @Get('/ekskul/:ekskul_id/export')
  async exportKasReport(
    @Request() req,
    @Res() res: Response,
    @Param('ekskul_id', ValidateEkskulExist) ekskulId: string,
    @Query('bulan') month: string,
    @Query('tahun') year: string
  ) {
    const { buffer, filename } = await this.kasService.exportKasReport(
      req.user, Number(ekskulId), month, year
    )
    this.sendWorkbook(res, buffer, filename)
  }

  private sendWorkbook(res: Response, buffer: Buffer, filename: string) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(buffer)
  }
}
