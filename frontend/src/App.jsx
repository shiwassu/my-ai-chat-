import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Button, List, Avatar, Switch, Space } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';

const BACKEND_URL = '在这里粘贴您复制的8000端口地址/chat';

const { Sider, Content } = Layout;

const App = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: '您好！有什么可以帮助您的吗？' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('zh');
  const messagesEndRef = useRef(null);

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
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput, language: language }),
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

  const handleLanguageChange = (checked) => {
    setLanguage(checked ? 'en' : 'zh');
  };

  return (
    // ... (这部分代码和之前一样)
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
          <div style={{ padding: '16px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex' }}>
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
            <div style={{ marginTop: '8px' }}>
              <Space>
                <Switch onChange={handleLanguageChange} />
                <span>用英文回答</span>
              </Space>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;