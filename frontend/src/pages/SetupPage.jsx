import { useState } from 'react'
import { api } from '../api'
import { SectionHeader, Card, Btn, Input, LogBox } from '../components/UI'

export default function SetupPage({ onRefresh }) {
  const [drivePath, setDrivePath] = useState('/content/drive/MyDrive/minecraft')
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  async function runSetup() {
    setLoading(true)
    setLogs(['[ LOG ] Iniciando setup...'])
    try {
      const res = await api.setup(drivePath)
      setLogs(res.logs || [])
      onRefresh?.()
    } catch (e) {
      setLogs(prev => [...prev, `[ ERROR ] ${e.message}`])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 32 }}>
      <SectionHeader icon="❗" title="Setup" description="Execute uma vez por sessão do Colab" />
      <Card style={{ maxWidth: 600 }}>
        <Input label="Caminho no Google Drive" value={drivePath} onChange={setDrivePath}
               placeholder="/content/drive/MyDrive/minecraft" />
        <Btn onClick={runSetup} disabled={loading}>
          {loading ? '⏳ Executando...' : '🚀 Executar Setup'}
        </Btn>
        {logs.length > 0 && <div style={{ marginTop: 16 }}><LogBox lines={logs} /></div>}
      </Card>
    </div>
  )
}
