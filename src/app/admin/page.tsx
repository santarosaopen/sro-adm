import Link from 'next/link'

const cards = [
  { href: '/admin/funcionarios', label: 'Funcionários', desc: 'Cadastro e credenciais', cor: 'blue' },
  { href: '/admin/funcoes', label: 'Funções', desc: 'Cargos operacionais', cor: 'indigo' },
  { href: '/admin/atividades', label: 'Atividades', desc: 'QR codes e execuções', cor: 'violet' },
  { href: '/admin/pontos', label: 'Presenças', desc: 'Registros de entrada', cor: 'green' },
  { href: '/admin/medidas', label: 'Medidas', desc: 'Água e energia', cor: 'cyan' },
  { href: '/admin/usuarios', label: 'Usuários', desc: 'Contas administrativas', cor: 'orange' },
  { href: '/admin/logs', label: 'Logs', desc: 'Auditoria do sistema', cor: 'gray' },
  { href: '/admin/configuracoes', label: 'Configurações', desc: 'GPS, cotas e retenção', cor: 'slate' },
]

const cores: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
  violet: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
  green: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100',
  orange: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
  gray: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
  slate: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
}

export default function PaginaAdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Área Administrativa</h1>
        <p className="mt-1 text-sm text-gray-500">Selecione um módulo para gerenciar</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href}
            className={`flex flex-col gap-1 rounded-xl border p-5 transition-colors ${cores[c.cor]}`}>
            <p className="font-semibold">{c.label}</p>
            <p className="text-xs opacity-70">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
