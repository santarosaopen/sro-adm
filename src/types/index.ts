export interface LeituraAgua {
  _id?: string
  valor: number
  data: string
  tipo: 'diaria' | 'mensal'
  cota?: number
  createdAt?: string
}

export interface LeituraEnergia {
  _id?: string
  valor: number
  data: string
  tipo: 'diaria' | 'mensal'
  createdAt?: string
}

export interface Funcionario {
  _id?: string
  nome: string
  cargo: string
  ativo: boolean
  atividades: string[]
  createdAt?: string
}

export interface RegistroPonto {
  _id?: string
  funcionarioId: string | { _id: string; nome: string; cargo: string }
  tipo: 'entrada' | 'saida'
  foto: string
  timestamp: string
  createdAt?: string
}

export interface ItemAtividade {
  nome: string
  concluida: boolean
}

export interface RegistroAtividade {
  _id?: string
  funcionarioId: string
  data: string
  itens: ItemAtividade[]
  createdAt?: string
}

export interface Configuracao {
  _id?: string
  chave: string
  valor: number | string
}
