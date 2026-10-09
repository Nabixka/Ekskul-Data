export function listEkskulSiswa(data: any) {
    const rawData = data.data || data

    const mergedUsersMap = rawData.reduce((acc: any, item: any) => {
        if (!acc[item.nis]) {
            acc[item.nis] = {
                nis: item.nis,
                murid_name: item.murid_name,
                kelas: item.kelas,
                jurusan: item.jurusan,
                ekskul_list: [item.ekskul_name] 
            }
        } else {
            if (!acc[item.nis].ekskul_list.includes(item.ekskul_name)) {
                acc[item.nis].ekskul_list.push(item.ekskul_name)
            }
        }
        return acc
    }, {})

    const uniqueStudents = Object.values(mergedUsersMap).map((student: any) => ({
        ...student,
        ekskul: student.ekskul_list.join(", "), 
        ekskul_list: undefined
    }))

    const grouped = uniqueStudents.reduce((acc: any, item: any) => {
        if (!acc[item.kelas]) {
            acc[item.kelas] = {}
        }

        if (!acc[item.kelas][item.jurusan]) {
            acc[item.kelas][item.jurusan] = []
        }

        acc[item.kelas][item.jurusan].push(item)

        return acc
    }, {})

    return grouped
}