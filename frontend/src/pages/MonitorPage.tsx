import { useState, useEffect, useRef } from 'react'
import { Card, Row, Col, Progress } from 'antd'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { monitorAPI } from '../services/api'
import {
  ApiOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useTheme } from '../ThemeContext'

interface SystemStats {
  cpu: { percent: number; count: number }
  memory: { total: number; available: number; percent: number }
  network: { bytes_sent: number; bytes_recv: number }
  gpu: { name: string; load: number; memory_used: number; memory_total: number }
}

interface StatCardProps {
  title: string
  value: number | string
  suffix?: string
  icon: React.ReactNode
  color: string
  subText: string
  percent?: number
}

const StatCard = ({ title, value, suffix, icon, color, subText, percent, isDarkMode }: StatCardProps & { isDarkMode: boolean }) => (
  <Card
    bordered={false}
    style={{
      background: isDarkMode ? '#151521' : '#ffffff',
      borderRadius: 16,
      height: '100%',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <div style={{ color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)', fontSize: 13, marginBottom: 4 }}>{title}</div>
        <div style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 24, fontWeight: 600 }}>
          {value} <span style={{ fontSize: 14, color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>{suffix}</span>
        </div>
      </div>
      <div style={{ 
        width: 40, height: 40, borderRadius: 10, 
        background: `${color}20`, color: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20
      }}>
        {icon}
      </div>
    </div>
    
    {percent !== undefined && (
        <Progress 
            percent={percent} 
            strokeColor={color} 
            trailColor="rgba(255,255,255,0.05)" 
            size="small" 
            showInfo={false} 
        />
    )}
    
    <div style={{ marginTop: 12, fontSize: 12, color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>
      {subText}
    </div>
  </Card>
)

interface HistoryItem {
  time: string
  cpu: number
  memory: number
}

export const MonitorPage = () => {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [networkSpeed, setNetworkSpeed] = useState({ up: 0, down: 0 })
  const lastNetworkRef = useRef<{ bytes_sent: number; bytes_recv: number; timestamp: number } | null>(null)
  const { isDarkMode } = useTheme()

  useEffect(() => {
    const loadStats = async () => {
        try {
        const response = await monitorAPI.getStats()
        setStats(response.data)
        
        // Calculate Speed
        const now = Date.now()
        if (lastNetworkRef.current) {
            const timeDiff = (now - lastNetworkRef.current.timestamp) / 1000
            if (timeDiff > 0) {
                const upSpeed = (response.data.network.bytes_sent - lastNetworkRef.current.bytes_sent) / timeDiff
                const downSpeed = (response.data.network.bytes_recv - lastNetworkRef.current.bytes_recv) / timeDiff
                setNetworkSpeed({
                    up: Math.max(0, upSpeed),
                    down: Math.max(0, downSpeed)
                })
            }
        }
        lastNetworkRef.current = {
            bytes_sent: response.data.network.bytes_sent,
            bytes_recv: response.data.network.bytes_recv,
            timestamp: now
        }

        setHistory((prev) => {
            const newHistory = [
            ...prev,
            {
                time: new Date().toLocaleTimeString(),
                cpu: response.data.cpu.percent,
                memory: response.data.memory.percent,
            },
            ]
            return newHistory.slice(-20)
        })
        } catch (error) {
            console.error(error)
        // Silent fail for polling
        }
    }

    loadStats()
    const interval = setInterval(loadStats, 2000)
    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes: number) => (bytes / (1024 ** 3)).toFixed(2) + ' GB'
  
  const formatSpeed = (bytesPerSec: number) => {
    if (bytesPerSec > 1024 * 1024) return (bytesPerSec / 1024 / 1024).toFixed(1) + ' MB/s'
    if (bytesPerSec > 1024) return (bytesPerSec / 1024).toFixed(1) + ' KB/s'
    return bytesPerSec.toFixed(0) + ' B/s'
  }

  if (!stats) return <div style={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)', textAlign: 'center', marginTop: 100 }}>加载系统状态...</div>

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <h2 style={{ color: isDarkMode ? '#fff' : '#000', marginBottom: 24, fontSize: 20, fontWeight: 600 }}>
        系统概览
      </h2>

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="CPU 使用率"
            value={stats.cpu.percent}
            suffix="%"
            percent={stats.cpu.percent}
            icon={<ApiOutlined />}
            color="#7c4dff"
            subText={`${stats.cpu.count} 核心`}
            isDarkMode={isDarkMode}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="内存使用"
            value={stats.memory.percent}
            suffix="%"
            percent={stats.memory.percent}
            icon={<DatabaseOutlined />}
            color="#448aff"
            subText={`${formatBytes(stats.memory.available)} 可用 / ${formatBytes(stats.memory.total)}`}
            isDarkMode={isDarkMode}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="网络流量"
            value={formatSpeed(networkSpeed.up + networkSpeed.down).split(' ')[0]}
            suffix={formatSpeed(networkSpeed.up + networkSpeed.down).split(' ')[1]}
            icon={<CloudOutlined />}
            color="#00e5ff"
            subText={`↑ ${formatSpeed(networkSpeed.up)}  ↓ ${formatSpeed(networkSpeed.down)}`}
            isDarkMode={isDarkMode}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
            <StatCard
                title="GPU 负载"
                value={stats.gpu.load}
                suffix="%"
                percent={stats.gpu.load}
                icon={<ThunderboltOutlined />}
                color="#f50057"
                subText={stats.gpu.name}
                isDarkMode={isDarkMode}
            />
        </Col>
      </Row>

      <Card
        bordered={false}
        style={{
          marginTop: 24,
          background: isDarkMode ? '#151521' : '#ffffff',
          borderRadius: 16,
          boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.08)'
        }}
        title={<span style={{ color: isDarkMode ? '#fff' : '#000' }}>性能趋势</span>}
      >
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={history}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c4dff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#7c4dff" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#448aff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#448aff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"} />
            <XAxis 
              dataKey="time" 
              stroke={isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.45)"}
              tick={{ fill: isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.45)", fontSize: 12 }}
            />
            <YAxis 
              stroke={isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.45)"}
              tick={{ fill: isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.45)", fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1f1f2e' : '#fff', 
                border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f0f0f0',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              itemStyle={{ color: isDarkMode ? '#fff' : '#000' }}
            />
            <Area type="monotone" dataKey="cpu" stroke="#7c4dff" fillOpacity={1} fill="url(#colorCpu)" name="CPU" />
            <Area type="monotone" dataKey="memory" stroke="#448aff" fillOpacity={1} fill="url(#colorMem)" name="Memory" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
