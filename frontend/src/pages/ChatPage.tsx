import { useState, useEffect, useRef } from 'react'
import { Card, Input, Button, List, Avatar, message } from 'antd'
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons'
import { chatAPI } from '../services/api'
import { useTheme } from '../ThemeContext'
import dayjs from 'dayjs'

const { TextArea } = Input

interface Message {
  id: number
  role: string
  content: string
  timestamp: string
}

export const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const requestSeqRef = useRef(0)
  const { isDarkMode } = useTheme()

  const sortMessages = (msgs: Message[]): Message[] => {
    return [...msgs].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      if (timeA !== timeB) return timeA - timeB
      return a.id - b.id
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadHistory = async () => {
    const currentSeq = ++requestSeqRef.current
    try {
      const response = await chatAPI.getHistory()
      if (currentSeq !== requestSeqRef.current) return
      setMessages(sortMessages(response.data))
    } catch (error) {
      if (currentSeq !== requestSeqRef.current) return
      console.error(error)
      message.error('加载聊天记录失败')
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) {
      return
    }

    const userMessage = input
    setInput('')
    
    const tempUserMsg = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }
    setMessages(sortMessages([...messages, tempUserMsg]))

    setLoading(true)
    try {
      await chatAPI.sendMessage('user', userMessage)
      await loadHistory()
    } catch (error) {
      console.error(error)
      message.error('发送消息失败')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
      <Card
        bordered={false}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: isDarkMode ? '#151521' : '#ffffff',
          borderRadius: 16,
          boxShadow: isDarkMode ? '0 4px 24px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
        }}
        bodyStyle={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Chat Header */}
        <div style={{ 
            padding: '16px 24px', 
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12
        }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: isDarkMode ? '#fff' : '#000' }}>智能助手</span>
            <span style={{ 
                fontSize: 12, 
                color: 'rgba(255,255,255,0.4)', 
                background: 'rgba(255,255,255,0.05)', 
                padding: '2px 8px', 
                borderRadius: 4 
            }}>
                在线
            </span>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: '1 1 0',
            overflowY: 'auto',
            padding: 24,
            scrollBehavior: 'smooth',
            minHeight: 0 // Crucial for flex scrolling
          }}
        >
          <List
            dataSource={messages}
            split={false}
            renderItem={(msg) => (
              <List.Item
                style={{
                  padding: '12px 0',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    maxWidth: '85%',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar
                    size={36}
                    icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    style={{
                      background: msg.role === 'user' 
                        ? '#3d3d5c'
                        : '#7c4dff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    
                    {/* Timestamp */}
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4, padding: '0 4px' }}>
                       {dayjs(msg.timestamp).format('HH:mm')}
                    </div>

                    {/* Bubble */}
                    <div
                      style={{
                        background: msg.role === 'user'
                          ? '#7c4dff'
                          : isDarkMode ? '#232333' : '#f0f0f0',
                        color: msg.role === 'user' ? '#fff' : (isDarkMode ? '#fff' : '#000'),
                        padding: '12px 18px',
                        borderRadius: msg.role === 'user' ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        lineHeight: 1.6,
                        fontSize: 14,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: 20,
            background: isDarkMode ? '#151521' : '#ffffff',
            borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <div style={{ 
              display: 'flex', 
              gap: 12, 
              background: isDarkMode ? '#0a0a14' : '#f5f5f5',
              padding: 8, 
              borderRadius: 12,
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`
          }}>
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              bordered={false}
              style={{
                color: isDarkMode ? '#fff' : '#000',
                fontSize: 14,
                resize: 'none'
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={loading}
              shape="circle"
              size="large"
              style={{
                background: '#7c4dff',
                border: 'none',
                minWidth: 40,
                height: 40
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
