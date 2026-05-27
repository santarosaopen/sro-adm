export interface PontoGrafico {
  label: string
  valor: number
}

type Leitura = { valor: number; data: Date | string }

export function agruparPorSemana(leituras: Leitura[]): PontoGrafico[] {
  const agora = new Date()
  const dados: Record<string, number> = {}

  for (let i = 6; i >= 0; i--) {
    const d = new Date(agora)
    d.setDate(agora.getDate() - i)
    const chave = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })
    dados[chave] = 0
  }

  const limite = new Date(agora)
  limite.setDate(agora.getDate() - 6)
  limite.setHours(0, 0, 0, 0)

  leituras.forEach((l) => {
    const d = new Date(l.data)
    if (d >= limite) {
      const chave = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })
      if (chave in dados) dados[chave] += l.valor
    }
  })

  return Object.entries(dados).map(([label, valor]) => ({ label, valor }))
}

export function agruparPorMes(leituras: Leitura[]): PontoGrafico[] {
  const agora = new Date()
  const dados: Record<string, number> = {}

  for (let i = 29; i >= 0; i--) {
    const d = new Date(agora)
    d.setDate(agora.getDate() - i)
    const chave = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    dados[chave] = 0
  }

  const limite = new Date(agora)
  limite.setDate(agora.getDate() - 29)
  limite.setHours(0, 0, 0, 0)

  leituras.forEach((l) => {
    const d = new Date(l.data)
    if (d >= limite) {
      const chave = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      if (chave in dados) dados[chave] += l.valor
    }
  })

  return Object.entries(dados).map(([label, valor]) => ({ label, valor }))
}

export function agruparPorAno(leituras: Leitura[]): PontoGrafico[] {
  const agora = new Date()
  const dados: Record<string, number> = {}

  for (let i = 11; i >= 0; i--) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1)
    const chave = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    dados[chave] = 0
  }

  const limite = new Date(agora.getFullYear() - 1, agora.getMonth(), 1)

  leituras.forEach((l) => {
    const d = new Date(l.data)
    if (d >= limite) {
      const chave = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      if (chave in dados) dados[chave] += l.valor
    }
  })

  return Object.entries(dados).map(([label, valor]) => ({ label, valor }))
}
