export function formatarData(data: string | Date): string {
  const d = new Date(data)
  // Usa componentes UTC para evitar shift de fuso: datas salvas como UTC midnight
  // aparecem como dia anterior no fuso BRT (UTC-3) se usarmos toLocaleDateString direto
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()).toLocaleDateString('pt-BR')
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
  const d = new Date()
  // Usa hora local (não UTC) para evitar retornar o dia seguinte após 21h BRT
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function nomeMes(data: Date): string {
  return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}
