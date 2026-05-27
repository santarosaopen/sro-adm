import Link from 'next/link'

const modulos = [
  {
    href: '/agua',
    titulo: 'Medidas de Água',
    descricao: 'Registre leituras, visualize gráficos, defina cotas e exporte relatórios PDF.',
    cor: 'bg-blue-500',
    icon: '💧',
  },
  {
    href: '/energia',
    titulo: 'Medidas de Energia',
    descricao: 'Acompanhe o consumo de energia e estime o custo da conta com a calculadora.',
    cor: 'bg-yellow-500',
    icon: '⚡',
  },
  {
    href: '/ponto',
    titulo: 'Registro de Horário',
    descricao: 'Registre entradas e saídas com foto e horário automático via webcam.',
    cor: 'bg-green-500',
    icon: '📋',
  },
  {
    href: '/atividades',
    titulo: 'Atividades',
    descricao: 'Gerencie e acompanhe as atividades diárias de cada funcionário via checklist.',
    cor: 'bg-purple-500',
    icon: '✅',
  },
  {
    href: '/admin',
    titulo: 'Administrativo',
    descricao: 'Área protegida: gerencie funcionários, atividades e registros de horário.',
    cor: 'bg-gray-700',
    icon: '🔐',
  },
]

export default function HomePage() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Sistema de Gestão Operacional
        </h1>
        <p className="mt-2 text-gray-500">
          Selecione um módulo para começar.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modulos.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${m.cor} text-2xl shadow-sm`}>
              {m.icon}
            </div>
            <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-600">
              {m.titulo}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">{m.descricao}</p>
            <span className="mt-4 text-sm font-medium text-blue-600">Acessar →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
