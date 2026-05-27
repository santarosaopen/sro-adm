import mongoose, { Schema, Document } from 'mongoose'

export interface IConfiguracao extends Document {
  chave: string
  valor: number | string
}

const ConfiguracaoSchema = new Schema<IConfiguracao>(
  {
    chave: { type: String, required: true, unique: true },
    valor: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
)

export default mongoose.models.Configuracao ||
  mongoose.model<IConfiguracao>('Configuracao', ConfiguracaoSchema)
