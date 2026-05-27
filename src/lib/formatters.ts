export function formatarData(data: string | Date): string {
  return new Date(data).toLocaleDateString('pt-BR')
}

export function formatarDataHora(data: string | Date): string {
  return new Date(data).toLocaleString('pt-BR')
}

export function formatarHora(data: string | Date): string {
  return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function formatarNumero(valor: number, decimais = 2): string {
  return valor.toFixed(decimais).replace('.', ',')
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function dataHoje(): string {
  return new Date().toISOString().split('T')[0]
}

export function nomeMes(data: Date): string {
  return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}
