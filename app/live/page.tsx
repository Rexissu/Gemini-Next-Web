'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    UserOutlined, 
    RobotOutlined, 
    PauseCircleOutlined, 
    PoweroffOutlined,
} from '@ant-design/icons';
import MediaButtons from '@/components/media-buttons';
import { useLiveAPIContext } from '@/vendor/contexts/LiveAPIContext';
import {
    RealtimeInputMessage,
    ClientContentMessage,
    ServerContentMessage,
} from '@/vendor/multimodal-live-types';
import { base64sToArrayBuffer, pcmBufferToBlob } from '@/vendor/lib/utils';

import {
    Layout,
    theme,
    Input,
    Flex,
    Select,
    Tag,
    Collapse,
    Button,
    Checkbox,
    Modal,
    Drawer,
} from 'antd';
import { Sender, Bubble } from '@ant-design/x';
import { useLocalStorageState } from 'ahooks';
import FieldItem from '@/components/field-item';
import { GPTVis } from '@antv/gpt-vis';
import { Part } from '@google/generative-ai';

interface AudioTranscriptProps {
  audioUrl: string;
  messageId: string | undefined;
}

const AudioTranscript: React.FC<AudioTranscriptProps> = ({ audioUrl, messageId }) => {
  const [transcript, setTranscript] = useState<string>('');
  const [translation, setTranslation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        setLoading(true);
        
        // 获取音频文件
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        
        // 将音频转换为base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1] || '';
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              audioData: base64Audio,
              messageId: messageId,
            }),
          });
          const data = await response.json();
          if (data.result) {
            setTranscript(data.result);
            setTranslation(data.translation || '');
          }
        };
      } catch (error) {
        console.error('语音识别失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTranscript();
  }, [audioUrl, messageId]);

  return (
    <div style={{ marginTop: 8 }}>
      {loading ? (
        <span>正在识别语音...</span>
      ) : transcript ? (
        <div>
          <div>识别结果: {transcript}</div>
          {translation && (
            <div style={{ marginTop: 8, color: '#666' }}>
              翻译结果: {translation}
            </div>
          )}
        </div>
      ) : (
        <span>未能识别语音内容</span>
      )}
    </div>
  );
};

const { Header, Content } = Layout;

interface ToolsState {
  codeExecution: boolean;
  functionCalling: boolean;
  automaticFunctionResponse: boolean;
  grounding: boolean;
}

const fooAvatar: React.CSSProperties = {
  color: '#f56a00',
  backgroundColor: '#fde3cf',
};

const barAvatar: React.CSSProperties = {
  color: '#fff',
  backgroundColor: '#1677ff',
};

type MessageType =
  | RealtimeInputMessage
  | ClientContentMessage
  | ServerContentMessage
  | null;

const isClientMessage = (
  message: MessageType
): message is ClientContentMessage => {
  return message !== null && 'clientContent' in message;
};

const isClientVideoMessage = (
  message: MessageType
): message is RealtimeInputMessage => {
  return message !== null && 'realtimeInput' in message;
};

const isServerMessage = (
  message: MessageType
): message is ServerContentMessage => {
  return message !== null && 'serverContent' in message;
};

const hasModelTurn = (
  content: ServerContentMessage['serverContent']
): content is { modelTurn: { parts: Part[] } } => {
  return 'modelTurn' in content && content.modelTurn !== null;
};

const MessageItem: React.FC<{ message: MessageType; style?: React.CSSProperties }> = ({ message, style }) => {
  const textComponent = useMemo(() => {
    if (isClientMessage(message)) {
      const content = message.clientContent.turns?.[0]?.parts
        .map((p) => p.text)
        .join('');
      return content ? (
        <Bubble
          key={message.id}
          placement='end'
          content={<GPTVis>{content}</GPTVis>}
          typing={{ step: 2, interval: 50 }}
          avatar={{
            icon: <UserOutlined />,
            style: fooAvatar,
          }}
        />
      ) : null;
    }

    if (isServerMessage(message) && hasModelTurn(message.serverContent)) {
      const content = message.serverContent.modelTurn.parts
        .map((p) => p?.text ?? '')
        .join('');
      return content ? (
        <Bubble
          key={message.id}
          placement='start'
          content={<GPTVis>{content}</GPTVis>}
          typing={{ step: 10, interval: 50 }}
          avatar={{
            icon: <RobotOutlined />,
            style: barAvatar,
          }}
        />
      ) : null;
    }
    return null;
  }, [message]);

  const audioComponent = useMemo(() => {
    if (isClientVideoMessage(message)) {
      const audioParts = message.realtimeInput.mediaChunks.filter(
        (p) => p.data
      );
      if (audioParts.length) {
        const base64s = audioParts
          .map((p) => p.data)
          .filter((data): data is string => data !== undefined);
        const buffer = base64sToArrayBuffer(base64s);
        const blob = pcmBufferToBlob(buffer, 24000);
        const audioUrl = URL.createObjectURL(blob);
        return (
          <Bubble
            key={`audio-${message.id}`}
            placement='end'
            content={
              <div>
                <audio
                  style={{
                    height: 30,
                  }}
                  controls
                  src={audioUrl}
                />
              </div>
            }
            avatar={{
              icon: <RobotOutlined />,
              style: barAvatar,
            }}
            styles={{
              content: {
                padding: 8,
              },
            }}
          />
        );
      }
    }
    
    if (isServerMessage(message) && hasModelTurn(message.serverContent)) {
      const audioParts = message.serverContent.modelTurn?.parts.filter(
        (p) => p.inlineData
      );
      if (audioParts.length) {
        const base64s = audioParts
          .map((p) => p.inlineData?.data)
          .filter((data): data is string => data !== undefined);
        const buffer = base64sToArrayBuffer(base64s);
        const blob = pcmBufferToBlob(buffer, 24000);
        const audioUrl = URL.createObjectURL(blob);
        return (
          <Bubble
            key={`audio-${message.id}`}
            placement='start'
            content={
              <div>
                <audio
                  style={{
                    height: 30,
                  }}
                  controls
                  src={audioUrl}
                />
                <div>
                  <AudioTranscript audioUrl={audioUrl} messageId={message.id} />
                </div>
              </div>
            }
            avatar={{
              icon: <RobotOutlined />,
              style: barAvatar,
            }}
            styles={{
              content: {
                padding: 8,
              },
            }}
          />
        );
      }
    }
    return null;
  }, [message]);

  return (
    <>
      {textComponent}
      {audioComponent}
    </>
  );
};

const LivePage: React.FC = () => {
    const [showModal, setShowModal] = useState(true);
    const [password, setPassword] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
    const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
    const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
    const [windowWidth, setWindowWidth] = useState(isMobile);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth <= 768);
        };
        
        const handleRightDrawerToggle = (e: Event) => {
            setRightDrawerOpen(true);
        };
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('toggleRightDrawer', handleRightDrawerToggle as EventListener);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('toggleRightDrawer', handleRightDrawerToggle as EventListener);
        };
    }, []);

    useEffect(() => {
        const fetchAdminPassword = async () => {
            const response = await fetch('/api/admin-password');
            const data = await response.json();
            setAdminPassword(data.adminPassword);
        };
        fetchAdminPassword();

        const cachedPassword = localStorage.getItem('adminPassword');
        if (cachedPassword === adminPassword) {
            setShowModal(false);
        }
    }, [adminPassword]);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleSubmitPwd = () => {
        if (password === adminPassword) {
            localStorage.setItem('adminPassword', password);
            setShowModal(false);
        } else {
            alert('密码错误');
        }
    };

    const {
        token: {
            colorBgLayout,
            colorFillAlter,
            borderRadiusLG,
            colorBgContainer,
        },
    } = theme.useToken();
    const videoRef = useRef<HTMLVideoElement>(null);
    // either the screen capture, the video or null, if null we hide it
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

    const {
        client,
        config,
        setConfig,
        connected,
        connect,
        disconnect,
        currentBotMessage,
        currentUserMessage,
    } = useLiveAPIContext();

    const [textInput, setTextInput] = useState('');

    const [systemInstruction, setSystemInstruction] = useLocalStorageState('systemInstruction', {
        defaultValue: '',
    });
    const [model, setModel] = useLocalStorageState('model', {
        defaultValue: 'gemini-2.0-flash-exp',
    });
    const [outPut, setOutPut] = useLocalStorageState('output', {
        defaultValue: 'audio',
    });
    const [voice, setVoice] = useLocalStorageState('voice', {
        defaultValue: 'Puck',
    });

    const [tools, setTools] = useLocalStorageState<ToolsState>('tools', {
        defaultValue: {
            codeExecution: false,
            functionCalling: false,
            automaticFunctionResponse: false,
            grounding: false,
        } as ToolsState,
    });

    const [toolsPaneActive, setToolsPaneActive] = useLocalStorageState<
        string[]
    >('tools-pane-active', {
        defaultValue: [],
    });

    const [messages, setMessages] = useState<MessageType[]>([]);

    const handleSubmit = () => {
        client.send([{ text: textInput }]);
        setTextInput('');
    };

    useEffect(() => {
        // 判断一组对话中，如果用户消息在系统消息之后，进行置换
        if (messages && messages.length >= 2 && isClientVideoMessage(messages[messages.length - 1])) {
            const lastMessage = messages.pop();
            if (lastMessage) {
                messages.splice(messages.length - 1, 0, lastMessage);
            }
        }
        console.log('messages', messages);
    }, [messages]);
    useEffect(() => {
        if (currentUserMessage) {
            setMessages((messages) => {
                if (messages.filter((m) => m?.id === currentUserMessage?.id).length > 0) {
                    return messages.map((m) => m?.id === currentUserMessage?.id ? currentUserMessage : m);
                } else {
                    return [...messages, currentUserMessage];
                }
            });
        }
    }, [currentUserMessage]);

    useEffect(() => {
        if (currentBotMessage) {
            setMessages((messages) => {
                if (messages.filter((m) => m?.id === currentBotMessage?.id).length > 0) {
                    return messages.map((m) => m?.id === currentBotMessage?.id ? currentBotMessage : m);
                } else {
                    return [...messages, currentBotMessage];
                }
            });
        }
    }, [currentBotMessage]);


    useEffect(() => {
        const speechConfig = {
            voiceConfig: {
                prebuiltVoiceConfig: {
                    voiceName: voice,
                },
            },
        };
        const generationConfig = {
            ...config?.generationConfig,
            speechConfig,
            responseModalities: outPut,
        } as typeof config.generationConfig;
        const systemInstructionConfig = systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined;
        setConfig({ ...config, generationConfig, systemInstruction: systemInstructionConfig });
    }, [connected, systemInstruction, model, outPut, voice]);

    const panelStyle: React.CSSProperties = {
        background: colorFillAlter,
        borderRadius: borderRadiusLG,
        border: 'none',
    };

    const handleDisconnect = () => {
        setVideoStream(null);
        disconnect();
    };

    return (
        <Layout style={{ height: '90vh', overflow: 'hidden' }}>
            {showModal && (
                <Modal
                    title="请输入管理密码"
                    open={showModal}
                    closable={false}
                    footer={null}
                >
                    <Input.Password
                        placeholder="请输入管理密码"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                    <div className='pt-3'>
                        <Button type="primary" onClick={handleSubmitPwd}>
                            提交
                        </Button>
                    </div>
                </Modal>
            )}
            <Header
                style={{
                    padding: windowWidth ? '0 12px' : '0 24px',
                    background: colorBgLayout,
                    fontSize: 22,
                    fontWeight: 500,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '48px',
                    lineHeight: '48px'
                }}
            >
                <span>Stream Realtime</span>
            </Header>
            <Layout style={{ height: 'calc(100vh - 48px)', overflow: 'hidden' }}>
                {/* Mobile Left Drawer */}
                {windowWidth && (
                    <Drawer
                        title="Gemini-Next-Web"
                        placement="left"
                        onClose={() => setLeftDrawerOpen(false)}
                        open={leftDrawerOpen}
                        width={300}
                    >
                        <div className='px-5 py-2'>
                            <Flex vertical gap='middle'>
                                <div style={{ fontSize: 16, fontWeight: 500 }}>Chat Settings</div>
                                <Collapse
                                    bordered={false}
                                    style={{ background: colorBgContainer }}
                                    items={[
                                        {
                                            key: 'prompts',
                                            label: 'System Instructions',
                                            children: (
                                                <Input.TextArea
                                                    value={systemInstruction}
                                                    onChange={(e) => setSystemInstruction(e.target.value)}
                                                    placeholder='Enter system instructions...'
                                                    autoSize={{ minRows: 3, maxRows: 6 }}
                                                />
                                            ),
                                            style: panelStyle,
                                        },
                                    ]}
                                />
                            </Flex>
                        </div>
                    </Drawer>
                )}

                {/* Main Content */}
                <Content
                    style={{
                        padding: windowWidth ? 0 : '20px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                    }}
                >
                    <Flex
                        vertical 
                        style={{ 
                            height: '100%',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            background: colorBgContainer,
                            borderRadius: windowWidth ? 0 : 20,
                        }}
                    >
                        {/* Chat Settings */}
                        {!windowWidth && (
                            <div style={{ padding: '20px 24px 0' }}>
                                <Flex vertical gap='middle'>
                                    <div style={{ fontSize: 16, fontWeight: 500 }}>Chat Settings</div>
                                    <Collapse
                                        bordered={false}
                                        style={{ background: colorBgContainer }}
                                        items={[
                                            {
                                                key: 'prompts',
                                                label: 'System Instructions',
                                                children: (
                                                    <Input.TextArea
                                                        value={systemInstruction}
                                                        onChange={(e) => setSystemInstruction(e.target.value)}
                                                        placeholder='Enter system instructions...'
                                                        autoSize={{ minRows: 3, maxRows: 6 }}
                                                    />
                                                ),
                                                style: panelStyle,
                                            },
                                        ]}
                                    />
                                </Flex>
                            </div>
                        )}
                        <div
                            className='messages'
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: windowWidth ? '8px' : '20px',
                                marginBottom: windowWidth ? '120px': '140px'
                            }}
                        >
                            <Flex vertical gap={windowWidth ? 8 : 16}>
                                {messages.map((message, index) => (
                                    <MessageItem
                                        key={message?.id ?? index}
                                        message={message}
                                        style={{
                                            maxWidth: windowWidth ? '85%' : '100%',
                                            marginLeft: isClientMessage(message) || isClientVideoMessage(message) ? 'auto' : windowWidth ? '8px' : '24px',
                                            marginRight: isClientMessage(message) || isClientVideoMessage(message) ? (windowWidth ? '8px' : '24px') : 'auto'
                                        }}
                                    />
                                ))}
                            </Flex>
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: colorBgContainer,
                            borderTop: '1px solid rgba(0,0,0,0.06)',
                            padding: windowWidth ? '8px' : '16px',
                            borderRadius: windowWidth ? 0 : '0 0 20px 20px',
                            zIndex: 10
                        }}>
                            <Flex vertical gap={16}>
                                <Flex justify='center'>
                                    <Button
                                        type={connected ? 'default' : 'primary'}
                                        onClick={connected ? handleDisconnect : connect}
                                        icon={connected ? <PauseCircleOutlined /> : <PoweroffOutlined />}
                                    >
                                        {connected ? 'Disconnect' : 'Click me to start !'}
                                    </Button>
                                </Flex>
                                <div style={{ pointerEvents: !connected ? 'none' : 'auto' }}>
                                    <Sender
                                        onChange={setTextInput}
                                        onSubmit={handleSubmit}
                                        value={textInput}
                                        disabled={!connected}
                                        prefix={
                                            <MediaButtons
                                                videoRef={videoRef}
                                                supportsVideo
                                                onVideoStreamChange={setVideoStream}
                                            />
                                        }
                                    />
                                </div>
                            </Flex>
                        </div>

                        {/* Floating Video */}
                        {videoStream && (
                            <video
                                style={{
                                    position: 'absolute',
                                    top: 70,
                                    right: windowWidth ? 10 : 20,
                                    maxWidth: windowWidth ? 150 : 300,
                                    borderRadius: 10,
                                    border: '1px solid #333',
                                }}
                                ref={videoRef}
                                autoPlay
                                playsInline
                            />
                        )}
                    </Flex>
                </Content>

                {/* PC Right Sidebar */}
                {!windowWidth && (
                    <Layout.Sider
                        width={250}
                        style={{
                            background: colorBgLayout,
                            padding: '20px 10px',
                            height: '100%',
                            overflow: 'auto'
                        }}
                    >
                        <Flex vertical gap={32}>
                            <div style={{ fontSize: 16, fontWeight: 500 }}>
                                Run settings
                            </div>
                            <FieldItem label='Model'>
                                <Select
                                    value={model}
                                    onChange={setModel}
                                    options={[
                                        {
                                            value: 'gemini-2.0-flash-exp',
                                            label: (
                                                <span>
											<span
                                                style={{
                                                    marginRight: 8,
                                                }}
                                            >
												Gemini 2.0 Flash Experimental
											</span>
											<Tag
                                                style={{
                                                    marginRight: 0,
                                                }}
                                                color='#87d068'
                                            >
												New
											</Tag>
										</span>
                                            ),
                                        },
                                    ]}
                                />
                            </FieldItem>
                            <FieldItem label='Output'>
                                <Select
                                    value={outPut}
                                    onChange={setOutPut}
                                    options={[
                                        {
                                            value: 'audio',
                                            label: 'Audio',
                                        },
                                        {
                                            value: 'text',
                                            label: 'Text',
                                        },
                                    ]}
                                />
                            </FieldItem>
                            <FieldItem label='Voice'>
                                <Select
                                    value={voice}
                                    onChange={setVoice}
                                    options={[
                                        {
                                            value: 'Puck',
                                            label: 'Puck',
                                        },
                                        {
                                            value: 'Oberon',
                                            label: 'Oberon',
                                        },
                                        {
                                            value: 'Titania',
                                            label: 'Titania',
                                        },
                                    ]}
                                />
                            </FieldItem>
                            <FieldItem label='Tools'>
                                <Collapse
                                    bordered={false}
                                    style={{ background: colorBgContainer }}
                                    activeKey={toolsPaneActive}
                                    onChange={(keys) =>
                                        setToolsPaneActive(
                                            keys as string[]
                                        )
                                    }
                                    items={[
                                        {
                                            key: 'tools',
                                            label: 'Tools',
                                            children: (
                                                <Flex vertical gap='small'>
                                                    <Checkbox
                                                        checked={
                                                            tools?.codeExecution ?? false
                                                        }
                                                        onChange={(e) =>
                                                            setTools({
                                                                ...(tools ?? {
                                                                    codeExecution: false,
                                                                    functionCalling: false,
                                                                    automaticFunctionResponse: false,
                                                                    grounding: false,
                                                                }),
                                                                codeExecution:
                                                                    e.target
                                                                        .checked,
                                                            })
                                                        }
                                                    >
                                                        Code Execution
                                                    </Checkbox>
                                                    <Checkbox
                                                        checked={
                                                            tools?.functionCalling ?? false
                                                        }
                                                        onChange={(e) =>
                                                            setTools({
                                                                ...(tools ?? {
                                                                    codeExecution: false,
                                                                    functionCalling: false,
                                                                    automaticFunctionResponse: false,
                                                                    grounding: false,
                                                                }),
                                                                functionCalling:
                                                                    e.target
                                                                        .checked,
                                                            })
                                                        }
                                                    >
                                                        Function Calling
                                                    </Checkbox>
                                                    <Checkbox
                                                        checked={
                                                            tools?.automaticFunctionResponse ?? false
                                                        }
                                                        onChange={(e) =>
                                                            setTools({
                                                                ...(tools ?? {
                                                                    codeExecution: false,
                                                                    functionCalling: false,
                                                                    automaticFunctionResponse: false,
                                                                    grounding: false,
                                                                }),
                                                                automaticFunctionResponse:
                                                                    e.target
                                                                        .checked,
                                                            })
                                                        }
                                                    >
                                                        Automatic Function Response
                                                    </Checkbox>
                                                    <Checkbox
                                                        checked={
                                                            tools?.grounding ?? false
                                                        }
                                                        onChange={(e) =>
                                                            setTools({
                                                                ...(tools ?? {
                                                                    codeExecution: false,
                                                                    functionCalling: false,
                                                                    automaticFunctionResponse: false,
                                                                    grounding: false,
                                                                }),
                                                                grounding:
                                                                    e.target
                                                                        .checked,
                                                            })
                                                        }
                                                    >
                                                        Grounding
                                                    </Checkbox>
                                                </Flex>
                                            ),
                                            style: panelStyle,
                                        },
                                    ]}
                                />
                            </FieldItem>
                        </Flex>
                    </Layout.Sider>
                )}
            </Layout>

            {/* Mobile Right Drawer */}
            {windowWidth && (
                <Drawer
                    title="Run Settings"
                    placement="right"
                    onClose={() => setRightDrawerOpen(false)}
                    open={rightDrawerOpen}
                    width={300}
                >
                    <div className='px-5 py-2'>
                        <Flex vertical gap='middle'>
                            <FieldItem label='System Instructions'>
                                <Input.TextArea
                                    value={systemInstruction}
                                    onChange={(e) => setSystemInstruction(e.target.value)}
                                    placeholder="Enter system instructions here..."
                                    autoSize={{ minRows: 3, maxRows: 6 }}
                                />
                            </FieldItem>
                            <FieldItem label='Model'>
                                <Select
                                    value={model}
                                    onChange={setModel}
                                    options={[
                                        {
                                            value: 'gemini-2.0-flash-exp',
                                            label: 'Gemini Flash',
                                        },
                                    ]}
                                />
                            </FieldItem>
                            <FieldItem label='Output'>
                                <Select
                                    value={outPut}
                                    onChange={setOutPut}
                                    options={[
                                        {
                                            value: 'audio',
                                            label: 'Audio',
                                        },
                                        {
                                            value: 'text',
                                            label: 'Text',
                                        },
                                    ]}
                                />
                            </FieldItem>
                            <FieldItem label='Voice'>
                                <Select
                                    value={voice}
                                    onChange={setVoice}
                                    options={[
                                        {
                                            value: 'Puck',
                                            label: 'Puck',
                                        },
                                        {
                                            value: 'Oberon',
                                            label: 'Oberon',
                                        },
                                        {
                                            value: 'Titania',
                                            label: 'Titania',
                                        },
                                    ]}
                                />
                            </FieldItem>
                            <FieldItem label='Tools'>
                                <Collapse
                                    bordered={false}
                                    style={{ background: colorBgContainer }}
                                    activeKey={toolsPaneActive}
                                    onChange={(keys) =>
                                        setToolsPaneActive(
                                            keys as string[]
                                        )
                                    }
                                    items={[
                                        {
                                            key: 'tools',
                                            label: 'Tools',
                                            children: (
                                                <Flex vertical gap='small'>
                                                    <Checkbox
                                                        checked={
                                                            tools?.codeExecution ?? false
                                                        }
                                                        onChange={(e) =>
                                                            setTools({
                                                                ...(tools ?? {
                                                                    codeExecution: false,
                                                                    functionCalling: false,
                                                                    automaticFunctionResponse: false,
                                                                    grounding: false,
                                                                }),
                                                                codeExecution:
                                                                    e.target
                                                                        .checked,
                                                            })
                                                        }
                                                    >
                                                        Code Execution
                                                    </Checkbox>
                                                    <Checkbox
                                                        checked={
                                                            tools?.functionCalling ?? false
                                                        }
                                                        onChange={(e) =>
                                                            setTools({
                                                                ...(tools ?? {
                                                                    codeExecution: false,
                                                                    functionCalling: false,
                                                                    automaticFunctionResponse: false,
                                                                    grounding: false,
                                                                }),
                                                                functionCalling:
                                                                    e.target
                                                                        .checked,
                                                            })
                                                        }
                                                    >
                                                        Function Calling
                                                    </Checkbox>
                                                    <Checkbox
                                                        checked={
                                                            tools?.automaticFunctionResponse ?? false
                                                        }
                                                        onChange={(e) =>
                                                            setTools({
                                                                ...(tools ?? {
                                                                    codeExecution: false,
                                                                    functionCalling: false,
                                                                    automaticFunctionResponse: false,
                                                                    grounding: false,
                                                                }),
                                                                automaticFunctionResponse:
                                                                    e.target
                                                                        .checked,
                                                            })
                                                        }
                                                    >
                                                        Automatic Function Response
                                                    </Checkbox>
                                                    <Checkbox
                                                        checked={
                                                            tools?.grounding ?? false
                                                        }
                                                        onChange={(e) =>
                                                            setTools({
                                                                ...(tools ?? {
                                                                    codeExecution: false,
                                                                    functionCalling: false,
                                                                    automaticFunctionResponse: false,
                                                                    grounding: false,
                                                                }),
                                                                grounding:
                                                                    e.target
                                                                        .checked,
                                                            })
                                                        }
                                                    >
                                                        Grounding
                                                    </Checkbox>
                                                </Flex>
                                            ),
                                            style: panelStyle,
                                        },
                                    ]}
                                />
                            </FieldItem>
                        </Flex>
                    </div>
                </Drawer>
            )}
        </Layout>
    );
};

export default LivePage;
