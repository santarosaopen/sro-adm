import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IItemAtividade {
  nome: string
  concluida: boolean
}

export interface IRegistroAtividade extends Document {
  funcionarioId: Types.ObjectId
  data: Date
  itens: IItemAtividade[]
}

const ItemAtividadeSchema = new Schema<IItemAtividade>(
  {
    nome: { type: String, required: true },
    concluida: { type: Boolean, default: false },
  },
  { _id: false }
)

const RegistroAtividadeSchema = new Schema<IRegistroAtividade>(
  {
    funcionarioId: { type: Schema.Types.ObjectId, ref: 'Funcionario', required: true },
    data: { type: Date, required: true },
    itens: { type: [ItemAtividadeSchema], default: [] },
  },
  { timestamps: true }
)

export default mongoose.models.RegistroAtividade ||
  mongoose.model<IRegistroAtividade>('RegistroAtividade', RegistroAtividadeSchema)
