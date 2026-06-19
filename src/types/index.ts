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

export interface Funcao {
  _id?: string
  nome: string
  ativo: boolean
  createdAt?: string
}

export interface Periodicidade {
  tipo: 'intervalo' | 'diasSemana'
  intervalo?: number
  diasSemana?: number[]
}

export interface Atividade {
  _id?: string
  nome: string
  funcaoId: string | { _id: string; nome: string }
  qrToken: string
  ativo: boolean
  periodicidade?: Periodicidade
  createdAt?: string
}

export interface ExecucaoAtividade {
  _id?: string
  atividadeId: string | { _id: string; nome: string; funcaoId: { nome: string } }
  funcionarioId: string | { _id: string; nome: string }
  nomeExecutor?: string
  fotoExecutor?: string
  fotos: string[]
  observacao?: string
  timestamp: string
  createdAt?: string
}

export interface AtividadeExtra {
  _id?: string
  funcionarioId: string | { _id: string; nome: string }
  descricao: string
  observacao?: string
  fotos: string[]
  timestamp: string
  createdAt?: string
}

export interface Funcionario {
  _id?: string
  nome: string
  username?: string
  ativo: boolean
  createdAt?: string
}

export interface RegistroPonto {
  _id?: string
  funcionarioId: string | { _id: string; nome: string }
  funcaoId: string | { _id: string; nome: string }
  foto: string
  timestamp: string
  createdAt?: string
}

export interface Configuracao {
  _id?: string
  chave: string
  valor: number | string
}
