import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { EkskulService } from 'src/ekskul/ekskul.service';
import { KegiatanService } from 'src/kegiatan/kegiatan.service';
import { getMyEkskulMapping } from 'src/Mapping/EkskulMapping';
import { ProfilMapping } from 'src/Mapping/ProfilMapping';

@Injectable()
export class MemberService {
    constructor(
        private databaseService: DatabaseService,
        private kegiatanService: KegiatanService,
        private ekskulService: EkskulService
    ) { }

    // Dashboard Member
    async getDashboardMember(req: { id: number, name: string, nis: number, is_admin: boolean }) {
        if (req.is_admin == true) throw new ForbiddenException("Anda Tidak Berhak Akses Dashboard Member")
        const getMyEkskul = await this.databaseService.connection("member_ekskul")
            .innerJoin("ekskul", "ekskul.id", "member_ekskul.ekskul_id")
            .select({
                ekskul_id: "ekskul.id",
                ekskul_name: "ekskul.name",
                ekskul_banner: "ekskul.banner",
                ekskul_bidang: "ekskul.bidang",
                role: "member_ekskul.role"
            })
            .where({
                nis_user: req.nis
            })

        const mappingEkskul = getMyEkskul.map((e) => e.ekskul_id)

        const getRecentKegiatan = await this.databaseService.connection("kegiatan")
            .select("*")
            .limit(3)
            .orderBy("waktu", 'desc')
            .whereIn("ekskul_id", mappingEkskul)

        return {
            message: "Berhasil Mendapatkan Profil",
            data: {
                name: req.name,
                is_admin: req.is_admin,
                ekskul: getMyEkskul.map(ProfilMapping),
                kegiatan: getRecentKegiatan
            }
        }
    }

    // Get My Ekskul
    async getMyEkskul(req: { nis: number, is_admin: boolean }) {
        const getEkskul = await this.databaseService.connection("member_ekskul")
            .innerJoin("ekskul", "ekskul.id", "member_ekskul.ekskul_id")
            .select({
                id: "member_ekskul.id",
                ekskul_id: "ekskul.id",
                ekskul_name: "ekskul.name",
                ekskul_banner: "ekskul.banner",
                ekskul_bidang: "ekskul.bidang",
                ekskul_about: "ekskul.about",

                role: "member_ekskul.role"
            })
            .where({ nis_user: req.nis })

        return {
            message: "Berhasil Mendapatkan Ekskul Anda",
            data: getEkskul.map(getMyEkskulMapping)
        }
    }

    async getMyEkskulDetail(req: { nis: number, is_admin: boolean }, ekskul_id: number) {
        if (req.is_admin) throw new ForbiddenException("Hanya Member yang Bisa Akses")

        const getEkskul = await this.databaseService.connection("member_ekskul")
            .innerJoin("ekskul", "ekskul.id", "member_ekskul.ekskul_id")
            .select({
                member_ekskul_id: "member_ekskul.id",
                id: "ekskul.id",
                name: "ekskul.name",
                banner: "ekskul.banner",
                bidang: "ekskul.bidang",
                about: "ekskul.about",

                role: "member_ekskul.role"
            })
            .where({ nis_user: req.nis, ekskul_id: ekskul_id })

        const getkegiatan = await this.kegiatanService.getListKegiatanEkskul(ekskul_id)
        const getMember = await this.ekskulService.getAllMember(req, ekskul_id)
        const mappingMember = getMember.data.map((e) => e.name)
        // const getKas = await this.databaseService.connection("kas")

        const payload = {
            ...getEkskul[0],
            kegiatan: getkegiatan.data.length,
            member: mappingMember.length,
            kas: 0
        }

        if (getEkskul.length === 0) throw new NotFoundException("Anda Belum Join Dengan Ekskul Ini")
        return {
            message: "Berhasil Mendapatkan Detail Ekskul Anda",
            data: payload
        }
    }
}