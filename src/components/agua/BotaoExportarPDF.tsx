'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { LeituraAgua } from '@/types'
import { formatarData, formatarNumero } from '@/lib/formatters'

interface Props {
  leituras: LeituraAgua[]
  cota?: number
}

export default function BotaoExportarPDF({ leituras, cota }: Props) {
  const [loading, setLoading] = useState(false)

  async function exportar() {
    setLoading(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF()

      doc.setFontSize(18)
      doc.setTextColor(37, 99, 235)
      doc.text('Relatório de Consumo de Água', 14, 20)

      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28)
      if (cota) doc.text(`Cota diária definida: ${formatarNumero(cota)} m³`, 14, 34)

      const diarias = leituras.filter((l) => l.tipo === 'diaria')
      const mensais = leituras.filter((l) => l.tipo === 'mensal')

      if (diarias.length) {
        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.text('Medições Diárias', 14, 45)

        autoTable(doc, {
          startY: 49,
          head: [['Data', 'Valor (m³)', 'Status']],
          body: diarias.map((l) => [
            formatarData(l.data),
            formatarNumero(l.valor),
            cota && l.valor > cota ? 'Acima da cota' : 'Normal',
          ]),
          headStyles: { fillColor: [37, 99, 235] },
          alternateRowStyles: { fillColor: [239, 246, 255] },
          styles: { fontSize: 9 },
        })
      }

      if (mensais.length) {
        const finalY = (doc as any).lastAutoTable?.finalY ?? 140
        doc.setFontSize(12)
        doc.text('Leituras da Companhia (Mensais)', 14, finalY + 10)
        autoTable(doc, {
          startY: finalY + 14,
          head: [['Data', 'Valor (m³)']],
          body: mensais.map((l) => [formatarData(l.data), formatarNumero(l.valor)]),
          headStyles: { fillColor: [16, 185, 129] },
          styles: { fontSize: 9 },
        })
      }

      doc.save(`consumo-agua-${new Date().toISOString().split('T')[0]}.pdf`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="secondary" onClick={exportar} loading={loading}>
      Exportar PDF
    </Button>
  )
}
