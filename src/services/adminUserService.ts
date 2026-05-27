import { createHash } from 'crypto'
import { connectDB } from '@/lib/mongodb'
import AdminUserModel from '@/models/AdminUser'

type AdminUserLean = {
  _id: unknown
  username: string
  nome: string
  passwordHash: string
  senhaOperacionalHash: string
  ativo: boolean
}

function sha256(s: string) {
  return createHash('sha256').update(s).digest('hex')
}

export async function ensureSeedUser() {
  await connectDB()
  const count = await AdminUserModel.countDocuments()
  if (count > 0) return
  const username = (process.env.ADMIN_USERNAME || 'admin').toLowerCase()
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  await AdminUserModel.create({
    username,
    nome: 'Administrador',
    passwordHash: sha256(password),
    senhaOperacionalHash: '',
    ativo: true,
  })
}

export async function verificarSenhaAdmin(
  username: string,
  senha: string
): Promise<{ ok: boolean; userId: string; nome: string }> {
  await connectDB()
  const user = await AdminUserModel.findOne({
    username: username.toLowerCase(),
    ativo: true,
  }).lean() as AdminUserLean | null
  if (!user) return { ok: false, userId: '', nome: '' }
  return {
    ok: user.passwordHash === sha256(senha),
    userId: String(user._id),
    nome: user.nome,
  }
}

export async function verificarSenhaOperacional(
  username: string,
  senha: string
): Promise<{ ok: boolean; nome: string }> {
  await connectDB()
  const user = await AdminUserModel.findOne({
    username: username.toLowerCase(),
    ativo: true,
  }).lean() as AdminUserLean | null
  if (!user || !user.senhaOperacionalHash) return { ok: false, nome: '' }
  return { ok: user.senhaOperacionalHash === sha256(senha), nome: user.nome }
}

export async function listarAdminUsers() {
  await connectDB()
  return AdminUserModel.find()
    .select('-passwordHash -senhaOperacionalHash')
    .sort({ createdAt: 1 })
    .lean()
}

export async function criarAdminUser(dados: {
  username: string
  nome: string
  senha: string
  senhaOperacional?: string
}) {
  await connectDB()
  return AdminUserModel.create({
    username: dados.username.toLowerCase().trim(),
    nome: dados.nome,
    passwordHash: sha256(dados.senha),
    senhaOperacionalHash: dados.senhaOperacional ? sha256(dados.senhaOperacional) : '',
    ativo: true,
  })
}

export async function editarAdminUser(
  id: string,
  dados: { nome?: string; senha?: string; senhaOperacional?: string; ativo?: boolean }
) {
  await connectDB()
  const update: Record<string, unknown> = {}
  if (dados.nome !== undefined) update.nome = dados.nome
  if (dados.ativo !== undefined) update.ativo = dados.ativo
  if (dados.senha) update.passwordHash = sha256(dados.senha)
  if (dados.senhaOperacional !== undefined) {
    update.senhaOperacionalHash = dados.senhaOperacional ? sha256(dados.senhaOperacional) : ''
  }
  return AdminUserModel.findByIdAndUpdate(id, update, { new: true })
    .select('-passwordHash -senhaOperacionalHash')
    .lean()
}

export async function deletarAdminUser(id: string) {
  await connectDB()
  return AdminUserModel.findByIdAndDelete(id)
}
