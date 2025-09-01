import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Button, List, Avatar } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';

// --- 重要：请将下面的地址替换为您刚刚复制的后端地址 ---
// --- 记得在地址最后加上 /chat ---
const BACKEND_URL = 'https://8000-shiwassu-myaichat-djmkbosgy0b.ws-us121.gitpod.io/chat';


const { Sider, Content } = Layout;

const App = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: '您好！有什么可以帮助您的吗？' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null); // 用于自动滚动

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // --- 修改：调用我们的后端 API ---
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputValue }),
      });

      if (!response.ok) {
        throw new Error('网络响应错误');
      }

      const data = await response.json();
      const aiResponse = { id: Date.now() + 1, sender: 'ai', text: data.response };
      setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error('Fetch错误:', error);
      const errorResponse = { id: Date.now() + 1, sender: 'ai', text: `抱歉，出错了: ${error.message}` };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={260} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '16px', fontWeight: 'bold' }}>会话列表</div>
      </Sider>
      <Layout>
        <Content style={{ display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
            <List
              dataSource={messages}
              renderItem={(item) => (
                <List.Item style={{ borderBottom: 'none' }}>
                  <List.Item.Meta
                    avatar={item.sender === 'user' ? <Avatar icon={<UserOutlined />} /> : <Avatar style={{ background: '#1890ff' }} icon={<RobotOutlined />} />}
                    title={item.sender === 'user' ? '您' : 'AI 助手'}
                    description={<div style={{ whiteSpace: 'pre-wrap' }}>{item.text}</div>}
                  />
                </List.Item>
              )}
            />
            <div ref={messagesEndRef} />
          </div>
          <div style={{ display: 'flex', padding: '16px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
            <Input
              size="large"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSend}
              placeholder="请输入您的问题..."
              disabled={isLoading}
            />
            <Button size="large" type="primary" onClick={handleSend} style={{ marginLeft: '8px' }} loading={isLoading}>
              发送
            </Button>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
