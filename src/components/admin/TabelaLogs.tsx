'use client'

interface LogEntry {
  _id: string
  adminUsername: string
  acao: string
  descricao: string
  createdAt: string
}

interface Props {
  logs: LogEntry[]
}

const acaoCores: Record<string, string> = {
  login: 'bg-gray-100 text-gray-700',
  criar_funcionario: 'bg-green-100 text-green-700',
  editar_funcionario: 'bg-blue-100 text-blue-700',
  deletar_funcionario: 'bg-red-100 text-red-700',
  deletar_registro_horario: 'bg-red-100 text-red-700',
  editar_leitura_agua: 'bg-blue-100 text-blue-700',
  deletar_leitura_agua: 'bg-red-100 text-red-700',
  editar_leitura_energia: 'bg-blue-100 text-blue-700',
  deletar_leitura_energia: 'bg-red-100 text-red-700',
  alterar_configuracao: 'bg-yellow-100 text-yellow-700',
  criar_usuario_admin: 'bg-green-100 text-green-700',
  editar_usuario_admin: 'bg-blue-100 text-blue-700',
  deletar_usuario_admin: 'bg-red-100 text-red-700',
  modo_operacional: 'bg-purple-100 text-purple-700',
}

function formatarData(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export default function TabelaLogs({ logs }: Props) {
  if (!logs.length) {
    return <p className="py-8 text-center text-sm text-gray-400">Nenhum log registrado.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="pb-2 pr-4">Data/Hora</th>
            <th className="pb-2 pr-4">Usuário</th>
            <th className="pb-2 pr-4">Ação</th>
            <th className="pb-2">Descrição</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {logs.map((log) => (
            <tr key={log._id} className="hover:bg-gray-50">
              <td className="py-2.5 pr-4 text-xs text-gray-500 whitespace-nowrap">
                {formatarData(log.createdAt)}
              </td>
              <td className="py-2.5 pr-4 font-medium text-gray-800">{log.adminUsername}</td>
              <td className="py-2.5 pr-4">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    acaoCores[log.acao] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {log.acao.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="max-w-[200px] break-words py-2.5 text-gray-600 sm:max-w-none">{log.descricao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
