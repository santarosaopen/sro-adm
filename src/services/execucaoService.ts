import { connectDB } from '@/lib/mongodb'
import ExecucaoAtividadeModel from '@/models/ExecucaoAtividade'
import FuncionarioModel from '@/models/Funcionario'
import RegistroPontoModel from '@/models/RegistroPonto'

async function buscarDadosExecutor(funcionarioId: string): Promise<{ nome: string; foto: string }> {
  const funcionario = await FuncionarioModel.findById(funcionarioId).select('nome').lean()
  const nome = funcionario?.nome ?? ''

  // Foto da presença de hoje (UTC-3)
  const agora = new Date()
  const brt = new Date(agora.getTime() - 3 * 60 * 60 * 1000)
  const hoje = new Date(Date.UTC(brt.getUTCFullYear(), brt.getUTCMonth(), brt.getUTCDate(), 3, 0, 0, 0))
  const amanha = new Date(Date.UTC(brt.getUTCFullYear(), brt.getUTCMonth(), brt.getUTCDate() + 1, 3, 0, 0, 0))

  const presenca = await RegistroPontoModel.findOne({
    funcionarioId,
    timestamp: { $gte: hoje, $lt: amanha },
  }).sort({ timestamp: -1 }).select('foto').lean()

  return { nome, foto: presenca?.foto ?? '' }
}

export async function criarExecucao(dados: {
  atividadeId: string
  funcionarioId: string
  fotos: string[]
  observacao?: string
}) {
  await connectDB()
  const { nome, foto } = await buscarDadosExecutor(dados.funcionarioId)
  return ExecucaoAtividadeModel.create({
    ...dados,
    nomeExecutor: nome,
    fotoExecutor: foto,
    timestamp: new Date(),
  })
}

export async function listarExecucoes(atividadeId?: string, funcionarioId?: string) {
  await connectDB()
  const filtro: Record<string, unknown> = {}
  if (atividadeId) filtro.atividadeId = atividadeId
  if (funcionarioId) filtro.funcionarioId = funcionarioId
  return ExecucaoAtividadeModel.find(filtro)
    .populate('atividadeId', 'nome funcaoId')
    .populate('funcionarioId', 'nome')
    .sort({ timestamp: -1 })
    .lean()
}

export async function deletarExecucao(id: string) {
  await connectDB()
  return ExecucaoAtividadeModel.findByIdAndDelete(id)
}
