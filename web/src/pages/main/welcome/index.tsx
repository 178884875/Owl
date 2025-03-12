import { Flexbox } from 'react-layout-kit';
import { Button, Input, Layout, Typography, Badge, Card, Tag, theme, notification, Tooltip, Skeleton, List, Dropdown, Image } from 'antd';
import {
  CloseOutlined,
  PaperClipOutlined,
  CameraOutlined,
  SendOutlined,
  MessageOutlined,
  DownOutlined,
  FileTextOutlined,
  FileMarkdownOutlined,
  BookOutlined,
  BulbOutlined,
  RobotOutlined,
  ExperimentOutlined,
  ApiOutlined,
  CodeOutlined,
  CloudOutlined,
  DatabaseOutlined,
  GithubOutlined
} from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import ModelFeatureTags from '@/features/ModelFeatureTags';
import { useChatStore } from '@/store/chat';
import { getIconByName } from '@/utils/iconutil';
import { MenuItemGroupType } from 'antd/es/menu/interface';
import { DEFAULT_MODEL, WEBSITE, GITHUB_URL } from '@/consts/app';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '@/apis/FileStorage';
import { getRecentSessions } from '@/apis/Session';
import TypewriterEffect from '@/features/TypewriterEffect';
const { Content } = Layout;
const { Text, } = Typography;
const { TextArea } = Input;
const { useToken } = theme;

export default function WelcomePage() {
  const { token } = useToken();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [showGoogleDocs, setShowGoogleDocs] = useState(true);
  const [isRecentChatsExpanded, setIsRecentChatsExpanded] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [loadModels, models, createSession] =
    useChatStore(state => [state.loadModels, state.models, state.createSession]);
  const [model, setModel] = useState<any>();

  const user = useUser();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return '早上好';
    } else if (hour >= 12 && hour < 14) {
      return '中午好';
    } else if (hour >= 14 && hour < 18) {
      return '下午好';
    } else if (hour >= 18 && hour < 22) {
      return '晚上好';
    } else {
      return '深夜了';
    }
  };

  useEffect(() => {
    loadModels().then((models) => {
      // 将所有 models 扁平化为一个数组
      const allChatModels = models.flatMap(x => x.models || []);

      // 如果没有模型，则提示
      if (allChatModels.length === 0) {
        notification.error({
          message: '没有可用模型',
        });

        setTimeout(() => {
          navigate('/console/channel');

          notification.info({
            message: '请先添加您的渠道，然后添加模型',
          });
        }, 1000);

        return;
      }

      // 查找默认模型
      const defaultModel = allChatModels.find(x => x.modelId === DEFAULT_MODEL);
      if (defaultModel) {
        setModel(defaultModel);
      } else {
        setModel(allChatModels[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    getRecentSessions().then((res) => {
      // 循环添加icon
      res.data.forEach((item: any) => {
        item.icon = getRandomIcon();
      });

      setRecentChats(res.data);
    });

    setLoading(false);
    // 检查是否已经显示过欢迎通知
    const hasShownWelcome = sessionStorage.getItem('hasShownWelcome');
    if (!hasShownWelcome) {
      sessionStorage.setItem('hasShownWelcome', 'true');
      notification.open({
        message: `欢迎回来, ${user?.displayName || 'Guest'}!`,
        description: '今天准备好协助您的项目了吗？',
        icon: <Badge status="processing" color={token.colorPrimary} />,
        placement: 'topRight',
        duration: 4,
      });
    }
  }, [user]);

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };

  const toggleRecentChats = () => {
    setIsRecentChatsExpanded(!isRecentChatsExpanded);
  };

  const renderModel = () => {
    const item = models?.find(item => item.models?.find((chatModel: { id: string | undefined; }) => chatModel.id === model?.id) !== undefined)?.models?.find((chatModel: { id: string | undefined; }) => chatModel.id === model?.id);
    return <Flexbox
      horizontal
      style={{
        fontSize: 16,
      }}
    >
      {getIconByName(item?.provider, 26)}
      {item?.displayName}
    </Flexbox>;
  }

  const handleTextFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (fileToRemove: File) => {
    setSelectedFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const triggerTextFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.cs,.java,.js,.ts,.py,.go,.php,.ruby,.swift,.sql,.html,.css,.json,.xml,.yaml,.yml,.toml,.ini,.csv,.tsv,.log';
    input.multiple = true;
    input.onchange = (e) => handleTextFileUpload(e as unknown as React.ChangeEvent<HTMLInputElement>);
    input.click();
  };

  const createChat = async () => {
    if (inputValue.trim() === '') {
      notification.error({
        message: '请输入内容',
      });
      return;
    }
    if (!model) {
      notification.error({
        message: '请选择模型',
      });
      return;
    }

    let files: any[] = [];

    // 处理图片文件
    if (selectedImage) {
      const result = await uploadFile(selectedImage);
      if (result.success) {
        files.push({
          id: result.data.id,
          fileName: result.data.fileName,
          path: result.data.path,
        });
      }
    }

    // 处理文本文件
    for (const file of selectedFiles) {
      const result = await uploadFile(file);
      if (result.success) {
        files.push({
          id: result.data.id,
          fileName: result.data.fileName,
          path: result.data.path,
        });
      }
    }

    const sessionId = await createSession({
      modelId: model?.id,
      value: inputValue,
      files: files
    });

    if (sessionId) {
      navigate('/chat?sessionId=' + sessionId);
    }
    setInputValue('');
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedFiles([]);
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        event.preventDefault();
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
          };
          reader.readAsDataURL(blob);
          setSelectedImage(blob);
        }
        break;
      }
    }
  };

  const chatIcons = [
    <BookOutlined />,
    <BulbOutlined />,
    <RobotOutlined />,
    <ExperimentOutlined />,
    <ApiOutlined />,
    <CodeOutlined />,
    <CloudOutlined />,
    <DatabaseOutlined />,
  ];

  const getRandomIcon = () => {
    const randomIndex = Math.floor(Math.random() * chatIcons.length);
    return chatIcons[randomIndex];
  };

  const formatTimeDisplay = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

    // 如果时间差小于1小时
    if (diffInMinutes < 60) {
      return `${diffInMinutes} 分钟前`;
    }
    // 如果时间差小于24小时
    else if (diffInHours < 24) {
      return `${diffInHours} 小时前`;
    }
    // 如果在本周内
    else if (diffInDays < 7) {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return weekdays[date.getDay()];
    }
    // 超过一周
    else {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Layout style={{ background: token.colorBgLayout }}>
        <Content style={{ padding: '0 16px', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <motion.div
            style={{ display: 'flex', justifyContent: 'center', marginTop: 24, marginBottom: 24 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Flexbox >
              <Tag color="purple" style={{ borderRadius: 16, padding: '2px 12px' }}>
                开 源 社 区 版
              </Tag>
              <Button
                onClick={() => window.open(GITHUB_URL, '_blank')}
                style={{
                  marginTop: 8,
                }}
                type='text'
              >
                <GithubOutlined />
                <Text>
                  Star
                </Text>
              </Button>
              <Button
                onClick={() => window.open('https://qm.qq.com/q/u8ClPTT3BC', '_blank')}
                style={{
                  marginTop: 8,
                }}
                type='text'
              >
                <Text>
                  加入QQ
                </Text>
              </Button>
            </Flexbox>
          </motion.div>

          <motion.div
            style={{ marginBottom: 24, position: 'relative' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Flexbox style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              width: '100%',
            }} horizontal>
              <Text style={{
                fontSize: 24,
                fontWeight: 600,
                fontStyle: 'italic',
                textAlign: 'center',
                marginBottom: 24
              }}>
                <TypewriterEffect
                  text={`${getGreeting()}，欢迎您使用雷神咖啡。`}
                  speed={150}
                />
              </Text>
            </Flexbox>
          </motion.div>

          <motion.div
            style={{ marginBottom: 24, position: 'relative' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card
              style={{
                borderRadius: token.borderRadius,
                marginBottom: 16,
                background: token.colorBgElevated,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <TextArea
                placeholder={`嗨，${user?.displayName || 'Guest'}，${getGreeting()}我可以帮助您什么？`}
                autoSize={{ minRows: 1, maxRows: 6 }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  resize: 'none',
                  fontSize: 16
                }}
                bordered={false}
                value={inputValue}
                onChange={handleInputChange}
                onPaste={handlePaste}
              />
              <Flexbox horizontal gap={8}>

                {(imagePreview || selectedFiles.length > 0) && (
                  <>
                    {imagePreview && (
                      <div style={{ marginBottom: 8, position: 'relative' }}>
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          style={{ maxWidth: '180px', maxHeight: 180, objectFit: 'contain' }}
                        />
                        <Button
                          type="text"
                          icon={<CloseOutlined />}
                          onClick={removeImage}
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            background: 'rgba(255, 255, 255, 0.8)',
                          }}
                        />
                      </div>
                    )}
                    {selectedFiles.map((file, index) => (
                      <Card
                        key={index}
                        size="small"
                        style={{
                          background: token.colorBgContainer,
                          width: 'fit-content',
                          height: 'fit-content',
                          margin: 5
                        }}
                        bodyStyle={{
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}
                      >
                        {file.name.endsWith('.md') ? (
                          <FileMarkdownOutlined style={{ fontSize: 16 }} />
                        ) : (
                          <FileTextOutlined style={{ fontSize: 16 }} />
                        )}
                        <Text style={{ maxWidth: 200 }} ellipsis={{ tooltip: file.name }}>
                          {file.name}
                        </Text>
                        <Button
                          type="text"
                          size="small"
                          icon={<CloseOutlined />}
                          onClick={() => removeFile(file)}
                          style={{ padding: 0 }}
                        />
                      </Card>
                    ))}
                  </>
                )}
              </Flexbox>
              <motion.div
                style={{ position: 'absolute', right: 12, bottom: 16 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {
                  inputValue ?
                    <Button
                      shape="circle"
                      type="primary"
                      onClick={createChat}
                      style={{
                        background: token.colorPrimary,
                        borderColor: token.colorPrimary
                      }}
                    >
                      <SendOutlined />
                    </Button> : <></>
                }
              </motion.div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 8,
                borderTop: `1px solid ${token.colorBorderSecondary}`,
                paddingTop: 12
              }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Tooltip title="添加文本文件 (txt, md,代码文件)">
                    <Button
                      type="text"
                      icon={<PaperClipOutlined />}
                      onClick={triggerTextFileUpload}
                    />
                  </Tooltip>
                  {model?.abilities?.vision && (
                    <Tooltip title="添加图片">
                      <Button type="text" icon={<CameraOutlined />} onClick={triggerImageUpload} />
                    </Tooltip>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                  <Flexbox style={{
                    justifyContent: 'flex-end',
                  }}>
                    <Dropdown
                      trigger={['click']}
                      menu={{
                        style: {
                          maxHeight: 200,
                          overflow: 'auto',
                        },
                        items: models?.map((item) => ({
                          label: item.provider,
                          type: 'group',
                          children: item.models?.map((chatModel: any) => ({
                            label:
                              <Flexbox
                                horizontal
                                style={{
                                  fontSize: 16,
                                }}
                              > <Tooltip
                                placement="right"
                                title={chatModel.description}>
                                  <div style={{
                                    flex: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    marginLeft: 5,
                                  }}>
                                    {chatModel.displayName}
                                  </div>
                                </Tooltip>
                                <ModelFeatureTags
                                  tokens={chatModel.contextWindowTokens}
                                  vision={chatModel.vision}
                                  functionCall={chatModel.functionCall}
                                />
                              </Flexbox>,
                            value: chatModel.id,
                            key: chatModel.id,
                            style: {
                              backgroundColor: chatModel.id === model?.id ? token.controlItemBgActiveHover : 'transparent',
                            },
                            onClick: () => {
                              setModel(chatModel);
                            },
                            icon: getIconByName(item.provider, 22),
                          })),
                        })) as MenuItemGroupType[] || [],
                      }}
                    >
                      <div style={{
                        cursor: 'pointer',
                      }}>
                        {renderModel()}
                      </div>
                    </Dropdown>
                  </Flexbox>
                  <DownOutlined style={{ fontSize: 10, marginRight: 40, }} />
                </div>
              </div>
            </Card>

            {/* Pasted banner */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.8 }}
            >
              <div style={{
                background: token.colorBgElevated,
                borderRadius: token.borderRadius,
                padding: '8px 16px',
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: `1px solid ${token.colorBorderSecondary}`
              }}>
                <div>
                  <Text style={{ color: token.colorPrimary, fontSize: 12 }}>
                    在每一次对话中，我们都会思考广泛，并进行推理，并给出详细的回答
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>PASTED</Text>
              </div>
            </motion.div>

            {showGoogleDocs && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
              >
                <Card
                  style={{
                    borderRadius: token.borderRadius,
                    marginTop: 16,
                    background: token.colorBgElevated,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  }}
                  bodyStyle={{ padding: '16px' }}
                  hoverable
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Tag color="blue" style={{ marginRight: 8 }}>NEW</Tag>
                      <Text>
                        最近的一些新闻
                      </Text>
                    </div>
                    <Button type="text" icon={<CloseOutlined />} onClick={() => setShowGoogleDocs(false)} />
                  </div>
                  <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                    我们正在努力开发中，敬请期待
                    <Text type='success'
                      onClick={() => {
                        window.open(WEBSITE, '_blank');
                      }}
                      style={{
                        marginLeft: 8,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: 12,
                        fontWeight: 500,
                        userSelect: 'none',
                        color: token.colorPrimary,
                      }}>
                      如果需要，可以联系我们
                    </Text>
                  </Text>
                </Card>
              </motion.div>
            )}

            {/* Recent chats */}
            <motion.div
              style={{
                marginTop: 24,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,    // 确保 flex 布局正常工作
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                  cursor: 'pointer',
                  flexShrink: 0  // 防止标题被压缩
                }}
                onClick={toggleRecentChats}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageOutlined />
                  <Text>
                    你的最近对话
                  </Text>
                  <DownOutlined
                    style={{
                      fontSize: 10,
                      transform: isRecentChatsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.3s'
                    }}
                  />
                </div>
                <Text type="secondary">
                  查看所有
                </Text>
              </div>

              <motion.div
                initial={false}
                animate={{
                  height: isRecentChatsExpanded ? 'auto' : 0,
                  opacity: isRecentChatsExpanded ? 1 : 0
                }}
                style={{
                  overflow: 'hidden',
                  flex: 1,        // 占用剩余空间
                  minHeight: 0,   // 确保滚动正常工作
                }}
              >
                {loading ? (
                  <Card
                    style={{
                      borderRadius: token.borderRadius,
                      background: token.colorBgElevated
                    }}
                    bodyStyle={{ padding: '12px 16px' }}
                  >
                    <Skeleton active paragraph={{ rows: 1 }} />
                  </Card>
                ) : (
                  <div style={{
                    height: '100%',
                    overflowY: 'auto',
                    paddingRight: 8,
                  }}>
                    <List
                      dataSource={recentChats}
                      renderItem={(item, index) => (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.2 + (index * 0.1) }}
                        >
                          <Card
                            key={item.id}
                            onClick={() => {
                              navigate('/chat?sessionId=' + item.id);
                            }}
                            style={{
                              borderRadius: token.borderRadius,
                              background: token.colorBgElevated,
                              marginBottom: 8,
                              cursor: 'pointer',
                              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                            }}
                            bodyStyle={{ padding: '12px 16px' }}
                            hoverable
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {item.icon}
                              <Text>{item.name}</Text>
                            </div>
                            <Text type="secondary" style={{ marginLeft: 24, fontSize: 12 }}>
                              {formatTimeDisplay(item.createdAt)}
                            </Text>
                          </Card>
                        </motion.div>
                      )}
                    />
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  );
}