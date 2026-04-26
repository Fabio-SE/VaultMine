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
    <div style={{ padding: '32px 36px' }}>
      <SectionHeader icon="❗" title="Setup" description="Execute uma vez por sessão do Colab" />

      <Card style={{ maxWidth: 600 }}>
        <div style={{
          marginBottom: 18, padding: '10px 14px',
          background: '#0a0d12', borderRadius: 6,
          border: '1px solid #594A2D33',
          borderLeft: '3px solid #594A2D',
          color: '#8C7549', fontSize: 11, lineHeight: 1.7,
        }}>
          ⚠ Configure o caminho do Google Drive onde os arquivos do servidor serão salvos.
        </div>

        <Input
          label="Caminho no Google Drive"
          value={drivePath}
          onChange={setDrivePath}
          placeholder="/content/drive/MyDrive/minecraft"
        />

        <Btn onClick={runSetup} disabled={loading} variant="primary" style={{
          padding: '10px 24px', fontSize: 12, letterSpacing: 1,
        }}>
          {loading ? <><span style={{ animation: 'spin 0.7s linear infinite', display: 'inline-block', marginRight: 6 }}>◌</span> EXECUTANDO...</> : '▶ EXECUTAR SETUP'}
        </Btn>

        {logs.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ color: '#594A2D', fontSize: 10, letterSpacing: 1.5, marginBottom: 6 }}>
              OUTPUT
            </div>
            <LogBox lines={logs} />
          </div>
        )}
      </Card>
    </div>
  )
}
