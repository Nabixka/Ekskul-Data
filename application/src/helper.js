export function formatDate(data){
    const date = new Date(data)
    const formattedDate = date.toLocaleTimeString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
    return formattedDate
}

export function formatRupiah(number){
  if (number === undefined || number === null) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number)
}