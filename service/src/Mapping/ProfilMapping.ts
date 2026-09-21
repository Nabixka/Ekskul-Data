export function ProfilMapping(data: any){
    return {
        id: data.ekskul_id,
        name: data.ekskul_name,
        bidang: data.ekskul_bidang,
        banner: data.ekskul_banner,
        role: data.role
    }
}