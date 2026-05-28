export interface PontoGrafico {
  label: string
  valor: number
}

type Leitura = { valor: number; data: Date | string }

// Converte leituras acumuladas em deltas de consumo (leitura[i] - leitura[i-1])
export function calcularDeltas(leituras: Leitura[]): Leitura[] {
  const sorted = [...leituras].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  )
  return sorted.slice(1).map((l, i) => ({
    data: l.data,
    valor: Math.max(0, l.valor - sorted[i].valor),
  }))
}

function inicioSemana(offset = 0): Date {
  const agora = new Date()
  const diaDaSemana = agora.getDay() // 0=Dom, 1=Seg, ..., 6=Sáb
  const diasAteSegunda = diaDaSemana === 0 ? 6 : diaDaSemana - 1
  const segunda = new Date(agora)
  segunda.setDate(agora.getDate() - diasAteSegunda + offset * 7)
  segunda.setHours(0, 0, 0, 0)
  return segunda
}

export function rotuloPeriodoSemana(offset = 0): string {
  const segunda = inicioSemana(offset)
  const domingo = new Date(segunda)
  domingo.setDate(segunda.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return `${fmt(segunda)} – ${fmt(domingo)}`
}

export function rotuloPeriodoMes(offset = 0): string {
  const agora = new Date()
  const d = new Date(agora.getFullYear(), agora.getMonth() + offset, 1)
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export function rotuloPeriodoAno(offset = 0): string {
  return String(new Date().getFullYear() + offset)
}

export function agruparPorSemana(leituras: Leitura[], offset = 0): PontoGrafico[] {
  const segunda = inicioSemana(offset)
  const domingo = new Date(segunda)
  domingo.setDate(segunda.getDate() + 6)
  domingo.setHours(23, 59, 59, 999)

  const dados: Record<string, number> = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date(segunda)
    d.setDate(segunda.getDate() + i)
    dados[d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })] = 0
  }

  leituras.forEach((l) => {
    const raw = new Date(l.data)
    const d = new Date(raw.getUTCFullYear(), raw.getUTCMonth(), raw.getUTCDate())
    if (d >= segunda && d <= domingo) {
      const chave = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })
      if (chave in dados) dados[chave] += l.valor
    }
  })

  return Object.entries(dados).map(([label, valor]) => ({ label, valor }))
}

export function agruparPorMes(leituras: Leitura[], offset = 0): PontoGrafico[] {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = agora.getMonth() + offset

  const inicio = new Date(ano, mes, 1)
  inicio.setHours(0, 0, 0, 0)
  const fim = new Date(ano, mes + 1, 0)
  fim.setHours(23, 59, 59, 999)

  const dados: Record<string, number> = {}
  const diasNoMes = fim.getDate()
  for (let d = 1; d <= diasNoMes; d++) {
    const date = new Date(ano, mes, d)
    dados[date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })] = 0
  }

  leituras.forEach((l) => {
    const raw = new Date(l.data)
    const d = new Date(raw.getUTCFullYear(), raw.getUTCMonth(), raw.getUTCDate())
    if (d >= inicio && d <= fim) {
      const chave = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      if (chave in dados) dados[chave] += l.valor
    }
  })

  return Object.entries(dados).map(([label, valor]) => ({ label, valor }))
}

export function agruparPorAno(leituras: Leitura[], offset = 0): PontoGrafico[] {
  const agora = new Date()
  const ano = agora.getFullYear() + offset

  const dados: Record<string, number> = {}
  for (let m = 0; m < 12; m++) {
    const d = new Date(ano, m, 1)
    dados[d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })] = 0
  }

  const inicio = new Date(ano, 0, 1)
  const fim = new Date(ano, 11, 31, 23, 59, 59, 999)

  leituras.forEach((l) => {
    const raw = new Date(l.data)
    const d = new Date(raw.getUTCFullYear(), raw.getUTCMonth(), raw.getUTCDate())
    if (d >= inicio && d <= fim) {
      const chave = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      if (chave in dados) dados[chave] += l.valor
    }
  })

  return Object.entries(dados).map(([label, valor]) => ({ label, valor }))
}
