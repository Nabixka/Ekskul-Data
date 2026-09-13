export function listKegiatan(data: any) {
    return {
        id: data.id,
        description: data.description,
        location: data.location,
        date: data.date
    }
}