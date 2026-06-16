import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Switch, message, Modal } from 'antd'
import { SaveOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { settingsAPI } from '../services/api'
import { useTheme } from '../ThemeContext'

interface Setting {
  key: string
  value: string
}

export const SettingsPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { isDarkMode, toggleTheme } = useTheme()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getAll()
      const settings = response.data as Setting[]
      
      const settingsMap: any = {}
      settings.forEach((s) => {
        settingsMap[s.key] = s.value
      })
      
      form.setFieldsValue({
        model_api: settingsMap.model_api || '',
        api_key: settingsMap.api_key || '',
        notification_system: settingsMap.notification_system === 'true',
        notification_message: settingsMap.notification_message === 'true',
        notification_performance: settingsMap.notification_performance === 'true',
      })
      
      // Theme set by context init
    } catch (error) {
        console.error(error)
      message.error('加载设置失败')
    }
  }

  const handleSave = async (values: any) => {
    setLoading(true)
    try {
      await settingsAPI.update('model_api', values.model_api || '')
      await settingsAPI.update('api_key', values.api_key || '')
      await settingsAPI.update('notification_system', values.notification_system ? 'true' : 'false')
      await settingsAPI.update('notification_message', values.notification_message ? 'true' : 'false')
      await settingsAPI.update('notification_performance', values.notification_performance ? 'true' : 'false')
      // Theme is updated via toggle, no need to save here unless we want to sync
      
      message.success('设置保存成功')
    } catch {
      message.error('保存设置失败')
    } finally {
      setLoading(false)
    }
  }

  const [modal, contextHolder] = Modal.useModal()

  const handleReset = () => {
    modal.confirm({
      title: '确认重置',
      icon: <ExclamationCircleOutlined />,
      content: '确定要重置所有设置为默认值吗?',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        // Reset form values
        form.setFieldsValue({
            model_api: '',
            api_key: '',
            notification_system: true,
            notification_message: true,
            notification_performance: true,
        })
        
        // Ensure Theme is reset (if not dark, make it dark as default)
        if (!isDarkMode) {
             await toggleTheme()
        }
        
        message.success('设置已重置 (需保存以生效)')
      },
    })
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
      {contextHolder}
      <h2 style={{ color: isDarkMode ? '#fff' : '#000', marginBottom: 24, fontSize: 20, fontWeight: 600 }}>
        设置
      </h2>

      <Card
        bordered={false}
        style={{
          background: isDarkMode ? '#151521' : '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          autoComplete="off"
        >
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16, marginBottom: 16 }}>外观</h3>
            <div style={{ background: isDarkMode ? '#0a0a14' : '#f5f5f5', padding: 20, borderRadius: 12, border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : '#e0e0e0'}` }}>
                <Form.Item label={<span style={{ color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>主题模式</span>} style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: 13 }}>切换深色/浅色主题风格</span>
                    <Switch
                        checked={isDarkMode}
                        onChange={toggleTheme}
                        checkedChildren="🌙"
                        unCheckedChildren="☀️"
                    />
                    </div>
                </Form.Item>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16, marginBottom: 16 }}>通知设置</h3>
            <div style={{ background: isDarkMode ? '#0a0a14' : '#f5f5f5', padding: 20, borderRadius: 12, border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : '#e0e0e0'}` }}>
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)', fontSize: 14, marginBottom: 4 }}>系统通知</div>
                        <div style={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 12 }}>启用桌面系统通知</div>
                    </div>
                    <Form.Item name="notification_system" valuePropName="checked" style={{ marginBottom: 0 }}>
                        <Switch />
                    </Form.Item>
                </div>

                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)', fontSize: 14, marginBottom: 4 }}>消息通知</div>
                        <div style={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 12 }}>新消息到达时通知</div>
                    </div>
                    <Form.Item name="notification_message" valuePropName="checked" style={{ marginBottom: 0 }}>
                        <Switch />
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)', fontSize: 14, marginBottom: 4 }}>性能警告</div>
                        <div style={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 12 }}>CPU/内存/GPU超过阈值时提醒</div>
                    </div>
                    <Form.Item name="notification_performance" valuePropName="checked" style={{ marginBottom: 0 }}>
                        <Switch />
                    </Form.Item>
                </div>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16, marginBottom: 16 }}>模型配置</h3>
            <div style={{ background: isDarkMode ? '#0a0a14' : '#f5f5f5', padding: 20, borderRadius: 12, border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : '#e0e0e0'}` }}>
                <Form.Item
                    label={<span style={{ color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>API 地址</span>}
                    name="model_api"
                >
                    <Input
                    placeholder="例如: https://api.openai.com/v1"
                    style={{
                        background: isDarkMode ? '#151521' : '#fff',
                        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#d9d9d9'}`,
                        color: isDarkMode ? '#fff' : '#000',
                        height: 40
                    }}
                    />
                </Form.Item>

                <Form.Item
                    label={<span style={{ color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>API 密钥</span>}
                    name="api_key"
                    style={{ marginBottom: 0 }}
                >
                    <Input.Password
                    placeholder="输入您的 API Key"
                    style={{
                        background: isDarkMode ? '#151521' : '#fff',
                        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#d9d9d9'}`,
                        color: isDarkMode ? '#fff' : '#000',
                        height: 40
                    }}
                    />
                </Form.Item>
            </div>
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button
                icon={<DeleteOutlined />}
                onClick={handleReset}
                size="large"
                style={{
                  background: 'transparent',
                  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#d9d9d9'}`,
                  color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
                }}
              >
                重置
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                size="large"
                style={{
                  background: '#7c4dff',
                  border: 'none',
                  paddingLeft: 24,
                  paddingRight: 24
                }}
              >
                保存更改
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
