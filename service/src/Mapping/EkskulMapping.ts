export function getMyEkskulMapping(data: any){
    return {
        id: data.ekskul_id,
        name: data.ekskul_name,
        banner: data.ekskul_banner,
        about: data.ekskul_about,

        role: data.role
    }
}