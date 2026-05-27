'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import SeletorFuncionario from '@/components/atividades/SeletorFuncionario'
import ChecklistAtividades from '@/components/atividades/ChecklistAtividades'
import { dataHoje } from '@/lib/formatters'
import { useModo } from '@/context/ModoContext'

export default function PaginaAtividades() {
  const [funcionarioId, setFuncionarioId] = useState('')
  const [data, setData] = useState(dataHoje())
  const { modo } = useModo()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Atividades dos Funcionários</h1>
        <p className="mt-1 text-sm text-gray-500">
          {modo === 'visualizacao' ? 'Visualize as atividades do dia' : 'Acompanhe e registre as atividades diárias realizadas'}
        </p>
      </div>

      <Card title="Selecionar Funcionário e Data">
        <SeletorFuncionario
          funcionarioId={funcionarioId}
          data={data}
          onFuncionarioChange={setFuncionarioId}
          onDataChange={setData}
        />
      </Card>

      {funcionarioId && (
        <Card title="Checklist de Atividades">
          <ChecklistAtividades
            key={`${funcionarioId}-${data}`}
            funcionarioId={funcionarioId}
            data={data}
            readOnly={modo === 'visualizacao'}
          />
        </Card>
      )}
    </div>
  )
}
