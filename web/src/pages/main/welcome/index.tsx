import { Flexbox } from 'react-layout-kit';
import { Button, Input, Layout, Typography, Divider, Badge, Card, Space, Tag, ConfigProvider, theme, notification, Tooltip, Skeleton, List, Dropdown, Image } from 'antd';
import { CloseOutlined, PaperClipOutlined, CameraOutlined, SendOutlined, ArrowDownOutlined, MessageOutlined, ProjectOutlined, DownOutlined, StarOutlined } from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import ModelFeatureTags from '@/features/ModelFeatureTags';
import { useChatStore } from '@/store/chat';
import { getIconByName } from '@/utils/iconutil';
import { MenuItemGroupType } from 'antd/es/menu/interface';
import { DEFAULT_MODEL, WEBSITE } from '@/consts/app';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '@/apis/FileStorage';

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
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [showGoogleDocs, setShowGoogleDocs] = useState(true);
  const [isRecentChatsExpanded, setIsRecentChatsExpanded] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadModels, models, createSession, setFiles] =
    useChatStore(state => [state.loadModels, state.models, state.createSession, state.setFiles]);
  const [model, setModel] = useState<string | undefined>();

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
      // 将所有 chatModels 扁平化为一个数组
      const allChatModels = models.flatMap(x => x.chatModels || []);
      // 查找默认模型
      const defaultModel = allChatModels.find(x => x.modelId === DEFAULT_MODEL);
      if (defaultModel) {
        setModel(defaultModel.id);
      } else {
        setModel(allChatModels[0]?.id);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    // 模拟数据加载
    setTimeout(() => {
      setRecentChats([
        { id: 1, title: '全面的网页开发指南', time: '18分钟前', icon: <ProjectOutlined /> },
        { id: 2, title: 'UI动画设计研究', time: '2小时前', icon: <StarOutlined /> },
        { id: 3, title: 'React组件优化', time: '1天前', icon: <ProjectOutlined /> }
      ]);
      setLoading(false);
    }, 1000);

    // 检查是否已经显示过欢迎通知
    const hasShownWelcome = sessionStorage.getItem('hasShownWelcome');
    if (!hasShownWelcome) {
      setTimeout(() => {
        notification.open({
          message: `欢迎回来, ${user?.displayName || 'Guest'}!`,
          description: '今天准备好协助您的项目了吗？',
          icon: <Badge status="processing" color={token.colorPrimary} />,
          placement: 'topRight',
          duration: 4,
        });
        // 设置标记表示已经显示过通知
        sessionStorage.setItem('hasShownWelcome', 'true');
      }, 1500);
    }
  }, [user]);

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const toggleRecentChats = () => {
    setIsRecentChatsExpanded(!isRecentChatsExpanded);
  };

  const renderModel = () => {
    const item = models?.find(item => item.chatModels?.find((chatModel: { id: string | undefined; }) => chatModel.id === model) !== undefined)?.chatModels?.find((chatModel: { id: string | undefined; }) => chatModel.id === model);
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

    let fileIds: string[] = [];

    if (selectedImage) {
      const result = await uploadFile(selectedImage);
      debugger;
      if (result.success) {
        fileIds.push(result.data.id);
      }
    }


    const sessionId = await createSession({
      modelId: model,
      value: inputValue,
      files: fileIds
    });

    if (sessionId) {
      navigate('/chat?sessionId=' + sessionId);
    }
    setInputValue('');
    setSelectedImage(null);
    setImagePreview(null);
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

  return (
    <Layout style={{ height: '100vh' }}>
      <Layout style={{ background: token.colorBgLayout }}>
        <Content style={{ padding: '0 16px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <motion.div
            style={{ display: 'flex', justifyContent: 'center', marginTop: 24, marginBottom: 24 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tag color="purple" style={{ borderRadius: 16, padding: '2px 12px' }}>
              开源社区版
            </Tag>
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
              {imagePreview && (
                <div style={{ marginTop: 16, position: 'relative' }}>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
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
                  <Tooltip title="Add attachment">
                    <Button type="text" icon={<PaperClipOutlined />} />
                  </Tooltip>
                  <Tooltip title="Add image">
                    <Button type="text" icon={<CameraOutlined />} onClick={triggerImageUpload} />
                  </Tooltip>
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
                          children: item.chatModels?.map((chatModel: any) => ({
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
                              backgroundColor: chatModel.id === model ? token.controlItemBgActiveHover : 'transparent',
                            },
                            onClick: () => {
                              setModel(chatModel.id);
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

            {/* Google Docs banner */}
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
                              <Text>{item.title}</Text>
                            </div>
                            <Text type="secondary" style={{ marginLeft: 24, fontSize: 12 }}>{item.time}</Text>
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