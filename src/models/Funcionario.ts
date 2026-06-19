import mongoose, { Schema, Document } from 'mongoose'

export interface IFuncionario extends Document {
  nome: string
  username: string
  senhaHash: string
  ativo: boolean
}

const FuncionarioSchema = new Schema<IFuncionario>(
  {
    nome: { type: String, required: true, trim: true },
    username: { type: String, default: '', trim: true, lowercase: true },
    senhaHash: { type: String, default: '' },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// Garante que mudanças no schema sejam aplicadas após hot reload do Next.js
try { mongoose.deleteModel('Funcionario') } catch {}
export default mongoose.model<IFuncionario>('Funcionario', FuncionarioSchema)
