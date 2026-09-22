export function formatDate(data){
    console.log(data)
    const date = new Date(data)
    const formattedDate = date.toLocaleTimeString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
    return formattedDate
}