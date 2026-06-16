import type { ReactNode } from 'react'
import { Layout as AntLayout, Menu, theme } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  MessageOutlined, 
  DashboardOutlined, 
  SettingOutlined,
  RobotOutlined
} from '@ant-design/icons'
import { useTheme } from '../ThemeContext'

const { Content, Sider } = AntLayout

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkMode } = useTheme()
  const { token } = theme.useToken()

  const menuItems = [
    {
      key: '/chat',
      icon: <MessageOutlined style={{ fontSize: '18px' }} />,
      label: '对话',
    },
    {
      key: '/monitor',
      icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
      label: '监控',
    },
    {
      key: '/settings',
      icon: <SettingOutlined style={{ fontSize: '18px' }} />,
      label: '设置',
    },
  ]

  return (
    <AntLayout style={{ height: '100vh', background: token.colorBgLayout, overflow: 'hidden' }}>
      {/* Invisible Drag Region for Electron Window Title */}
      <div className="title-drag-region" />

      <Sider
        width={80}
        style={{
          background: isDarkMode ? '#0f0f1e' : '#f5f5f5', 
          borderRight: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : '#e0e0e0'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 48, // Space for Traffic Lights (MAC)
        }}
        collapsed={true} // Icon only mode for cleaner look
        collapsedWidth={80}
        trigger={null}
      >
        <div style={{ 
            height: 48, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginBottom: 20
        }}>
            <div style={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #7c4dff 0%, #448aff 100%)',
                borderRadius: 12,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(124, 77, 255, 0.3)'
            }}>
                <RobotOutlined style={{ fontSize: 24, color: '#fff' }} />
            </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
          theme={isDarkMode ? "dark" : "light"}
        />
      </Sider>

      <AntLayout style={{ background: 'transparent', height: '100%' }}>
        <Content
          style={{
            margin: 0,
            padding: '48px 24px 24px 24px', // Top padding for Drag Region
            background: 'transparent',
            height: '100%',
            overflow: 'auto', // Enable scrolling
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
