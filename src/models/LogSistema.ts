import mongoose, { Schema, Document } from 'mongoose'

export interface ILogSistema extends Document {
  adminUsername: string
  acao: string
  descricao: string
}

const LogSistemaSchema = new Schema<ILogSistema>(
  {
    adminUsername: { type: String, default: 'sistema' },
    acao: { type: String, required: true },
    descricao: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.models.LogSistema ||
  mongoose.model<ILogSistema>('LogSistema', LogSistemaSchema)
