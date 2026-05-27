import mongoose, { Schema, Document } from 'mongoose'

export interface IFuncionario extends Document {
  nome: string
  cargo: string
  ativo: boolean
  atividades: string[]
}

const FuncionarioSchema = new Schema<IFuncionario>(
  {
    nome: { type: String, required: true, trim: true },
    cargo: { type: String, required: true, trim: true },
    ativo: { type: Boolean, default: true },
    atividades: { type: [String], default: [] },
  },
  { timestamps: true }
)

export default mongoose.models.Funcionario ||
  mongoose.model<IFuncionario>('Funcionario', FuncionarioSchema)
