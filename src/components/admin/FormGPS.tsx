'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'

interface GpsConfig {
  latitude: string
  longitude: string
  raioMetros: string
}

async function salvarChave(chave: string, valor: string) {
  await fetch('/api/configuracao', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chave, valor }),
  })
}

export default function FormGPS() {
  const [config, setConfig] = useState<GpsConfig>({ latitude: '', longitude: '', raioMetros: '100' })
  const [form, setForm] = useState<GpsConfig>({ latitude: '', longitude: '', raioMetros: '100' })
  const [capturando, setCapturando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [removendo, setRemovendo] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/configuracao?chave=gps_latitude').then((r) => r.json()),
      fetch('/api/configuracao?chave=gps_longitude').then((r) => r.json()),
      fetch('/api/configuracao?chave=gps_raio_metros').then((r) => r.json()),
    ]).then(([latRes, lonRes, raioRes]) => {
      const saved: GpsConfig = {
        latitude: latRes?.valor ? String(latRes.valor) : '',
        longitude: lonRes?.valor ? String(lonRes.valor) : '',
        raioMetros: raioRes?.valor ? String(raioRes.valor) : '100',
      }
      setConfig(saved)
      setForm(saved)
    }).finally(() => setLoading(false))
  }, [])

  async function capturarLocalizacao() {
    if (!navigator.geolocation) {
      setMensagem({ tipo: 'erro', texto: 'Geolocalização não suportada neste navegador.' })
      return
    }
    setCapturando(true)
    setMensagem(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(7),
          longitude: pos.coords.longitude.toFixed(7),
        }))
        setCapturando(false)
      },
      (err) => {
        setCapturando(false)
        if (err.code === 1) {
          setMensagem({ tipo: 'erro', texto: 'Permissão de localização negada. Permita o acesso ao GPS no navegador.' })
        } else if (err.code === 2) {
          setMensagem({ tipo: 'erro', texto: 'Localização indisponível. Verifique se o GPS está ativo.' })
        } else {
          setMensagem({ tipo: 'erro', texto: 'Tempo esgotado ao obter localização. Tente novamente.' })
        }
      },
      { timeout: 15000, enableHighAccuracy: true }
    )
  }

  async function salvar() {
    const lat = parseFloat(form.latitude.replace(',', '.'))
    const lon = parseFloat(form.longitude.replace(',', '.'))
    const raio = parseInt(form.raioMetros)

    if (isNaN(lat) || isNaN(lon)) {
      setMensagem({ tipo: 'erro', texto: 'Latitude e longitude inválidas.' })
      return
    }
    if (isNaN(raio) || raio <= 0) {
      setMensagem({ tipo: 'erro', texto: 'Raio de tolerância inválido.' })
      return
    }

    setSalvando(true)
    setMensagem(null)
    try {
      await Promise.all([
        salvarChave('gps_latitude', String(lat)),
        salvarChave('gps_longitude', String(lon)),
        salvarChave('gps_raio_metros', String(raio)),
      ])
      const saved = { latitude: String(lat), longitude: String(lon), raioMetros: String(raio) }
      setConfig(saved)
      setForm(saved)
      setMensagem({ tipo: 'ok', texto: 'Localização de referência salva com sucesso.' })
    } finally {
      setSalvando(false)
    }
  }

  async function remover() {
    setRemovendo(true)
    setMensagem(null)
    try {
      await Promise.all([
        salvarChave('gps_latitude', ''),
        salvarChave('gps_longitude', ''),
        salvarChave('gps_raio_metros', '100'),
      ])
      const vazio = { latitude: '', longitude: '', raioMetros: '100' }
      setConfig(vazio)
      setForm(vazio)
      setMensagem({ tipo: 'ok', texto: 'Verificação de GPS removida.' })
    } finally {
      setRemovendo(false)
    }
  }

  if (loading) {
    return <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
  }

  const ativo = Boolean(config.latitude && config.longitude)

  return (
    <div className="space-y-4">
      {ativo && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <p className="font-medium">Verificação GPS ativa</p>
          <p className="mt-0.5 text-green-700">
            Referência: {Number(config.latitude).toFixed(5)}, {Number(config.longitude).toFixed(5)} — tolerância {config.raioMetros} m
          </p>
        </div>
      )}

      {!ativo && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
          Nenhuma localização de referência definida. Os registros de horário não exigirão GPS.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Latitude</label>
          <input
            type="text"
            value={form.latitude}
            onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            placeholder="Ex: -23.5505"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Longitude</label>
          <input
            type="text"
            value={form.longitude}
            onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            placeholder="Ex: -46.6333"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="sm:w-48">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Tolerância (metros)
        </label>
        <input
          type="number"
          min="1"
          value={form.raioMetros}
          onChange={(e) => setForm({ ...form, raioMetros: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">
          Distância máxima permitida em relação ao ponto de referência.
        </p>
      </div>

      {mensagem && (
        <p className={`text-sm font-medium ${mensagem.tipo === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
          {mensagem.texto}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" loading={capturando} onClick={capturarLocalizacao}>
          Usar minha localização atual
        </Button>
        <Button loading={salvando} onClick={salvar}>
          Salvar referência
        </Button>
        {ativo && (
          <Button variant="danger" loading={removendo} onClick={remover}>
            Remover GPS
          </Button>
        )}
      </div>
    </div>
  )
}
