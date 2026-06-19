import mongoose, { Schema, Document } from 'mongoose'

export interface IFuncao extends Document {
  nome: string
  ativo: boolean
}

const FuncaoSchema = new Schema<IFuncao>(
  {
    nome: { type: String, required: true, trim: true },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
)

try { mongoose.deleteModel('Funcao') } catch {}
export default mongoose.model<IFuncao>('Funcao', FuncaoSchema)
