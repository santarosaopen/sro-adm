'use client'

import { useState, useEffect } from 'react'
import { formatarMoeda, formatarNumero } from '@/lib/formatters'

export default function CalculadoraEnergia() {
  const [kWh, setKWh] = useState('')
  const [tarifa, setTarifa] = useState('0.99')
  const [icms, setIcms] = useState('25')

  useEffect(() => {
    const salvo = localStorage.getItem('tarifa_energia')
    if (salvo) setTarifa(salvo)
  }, [])

  function handleTarifaChange(v: string) {
    setTarifa(v)
    localStorage.setItem('tarifa_energia', v)
  }

  const consumo = parseFloat(kWh) || 0
  const tarifaNum = parseFloat(tarifa) || 0
  const icmsNum = parseFloat(icms) || 0

  const subtotal = consumo * tarifaNum
  const valorIcms = subtotal * (icmsNum / 100)
  const total = subtotal + valorIcms

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Consumo (kWh)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={kWh}
            onChange={(e) => setKWh(e.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Tarifa (R$/kWh)
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={tarifa}
            onChange={(e) => handleTarifaChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">ICMS (%)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={icms}
            onChange={(e) => setIcms(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>
      </div>

      {consumo > 0 && (
        <div className="rounded-xl bg-yellow-50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({formatarNumero(consumo, 2)} kWh × R$ {tarifaNum.toFixed(3)})</span>
            <span className="font-medium">{formatarMoeda(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">ICMS ({icms}%)</span>
            <span className="font-medium">{formatarMoeda(valorIcms)}</span>
          </div>
          <div className="flex justify-between border-t border-yellow-200 pt-2">
            <span className="font-semibold text-gray-800">Total Estimado</span>
            <span className="text-xl font-bold text-yellow-600">{formatarMoeda(total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
