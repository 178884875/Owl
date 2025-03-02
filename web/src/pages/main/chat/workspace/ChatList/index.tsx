import { useChatStore } from '@/store/chat';
import { Flexbox } from 'react-layout-kit';
import { getMessages, updateMessage } from '@/apis/Message';
import { useEffect, useState } from 'react';
import { Bubble } from '@ant-design/x';
import { Avatar, Button, message, Popconfirm, Tooltip, Spin, Card, Typography, Image, Input, Collapse } from 'antd';
import { useUserStore } from '@/store/user';
import { SyncOutlined, CopyOutlined, DeleteOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';
import { Markdown } from '@lobehub/ui';
import { deleteMessage } from '@/apis/Message';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { FileMarkdownOutlined, FileTextOutlined } from '@ant-design/icons';
import { theme } from 'antd';
import { UpdateMessage } from '@/types/Message';
const { Text, } = Typography;
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

export default function ChatList() {
    const { token } = theme.useToken();
    const [
        messages,
        setMessages,
        currentSession,
        regenerateMessage
    ] =
        useChatStore(state => [state.messages, state.setMessages, state.currentSession, state.regenerateMessage]);

    const user = useUserStore(state => state.user);

    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');
    const [showThinking, setShowThinking] = useState(true);


    const loadMessages = async () => {
        try {
            if (!currentSession) return;
            if (currentSession.id === -1) return;

            const result = await getMessages(currentSession.id);
            if (result.success) {
                setMessages(result.data);
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        loadMessages();
    }, [currentSession]);

    const handleEditMessage = async (messageId: number) => {
        const messageToEdit = messages.find(m => m.id === messageId);
        if (messageToEdit) {
            setEditingMessageId(messageId);
            setEditingText(messageToEdit.texts[messageToEdit.currentIndex ?? messageToEdit.texts.length - 1].text);
        }
    };

    const handleSaveEdit = async (messageId: number) => {
        try {
            const updateData: UpdateMessage = {
                texts: [{ id: messageId, text: editingText }]
            };
            await updateMessage(messageId, updateData);
            const updatedMessages = messages.map(m =>
                m.id === messageId
                    ? { ...m, texts: [...m.texts, { text: editingText }], currentIndex: m.texts.length }
                    : m
            );
            setMessages(updatedMessages);
            setEditingMessageId(null);
            message.success('消息已更新');
        } catch (error) {
            console.error('更新消息失败:', error);
            message.error('更新消息失败');
        }
    };

    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setEditingText('');
    };

    const renderFile = (file: any, index: number) => {
        // 根据文件名判断文件类型
        const fileType = file.fileName.split('.').pop();
        if (fileType === 'md') {
            return <Card
                key={index}
                size="small"
                style={{
                    background: token.colorBgContainer,
                    width: 'fit-content',
                    height: 'fit-content',
                    cursor: 'pointer',
                    margin: 5
                }}
                bodyStyle={{
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}
            >
                {file.fileName.endsWith('.md') ? (
                    <FileMarkdownOutlined style={{ fontSize: 16 }} />
                ) : (
                    <FileTextOutlined style={{ fontSize: 16 }} />
                )}
                <Text style={{ maxWidth: 200 }} ellipsis={{ tooltip: file.fileName }}>
                    {file.fileName}
                </Text>
            </Card>
        }

        //如果是图片，则返回图片
        if (fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg') {
            return <Image style={{
                maxHeight: 100,
                maxWidth: 100,
                cursor: 'pointer',
                margin: 5
            }} src={'/api/FileStorage?id=' + file.fileId} />
        }

        // 如果是pdf则显示文件
        if (fileType === 'pdf') {
            return <Card
                key={index}
                size="small"
                style={{
                    background: token.colorBgContainer,
                    width: 'fit-content',
                    height: 'fit-content',
                    cursor: 'pointer',
                    margin: 5
                }}
                bodyStyle={{
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}
                onClick={() => {
                    window.open('/api/FileStorage?id=' + file.fileId, '_blank');
                }}
            >
                <FileTextOutlined style={{ fontSize: 16 }} />
                <Text style={{ maxWidth: 200 }} ellipsis={{ tooltip: file.fileName }}>
                    {file.fileName}
                </Text>
            </Card>
        }

        // 如果是其他类型的文件，返回默认的文件卡片
        return <Card
            key={index}
            size="small"
            style={{
                background: token.colorBgContainer,
                width: 'fit-content',
                height: 'fit-content',
                cursor: 'pointer',
                margin: 5
            }}
            bodyStyle={{
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: 8
            }}
            onClick={() => {
                window.open('/api/FileStorage?id=' + file.fileId, '_blank');
            }}
        >
            <FileTextOutlined style={{ fontSize: 16 }} />
            <Text style={{ maxWidth: 200 }} ellipsis={{ tooltip: file.fileName }}>
                {file.fileName}
            </Text>
        </Card>
    }

    const renderContent = (chatMessage: any) => {
        // 如果消息是...则显示加载
        const currentText = chatMessage.texts[chatMessage.currentIndex ?? chatMessage.texts?.length - 1];
        if (currentText?.text === '...' && (currentText?.reasoningUpdate === '' || currentText?.reasoningUpdate === null) && (currentText?.searchResults && currentText?.searchResults.length === 0)) {
            return <Spin />
        }

        return <>
            {currentText?.searchResults?.length > 0 && (
                <Collapse
                    ghost
                    style={{ marginBottom: 8 }}
                >
                    <Collapse.Panel
                        header={`搜索结果 (${currentText?.searchResults.length})`}
                        key="1"
                    >
                        {currentText?.searchResults.map((result: any) => (
                            <Flexbox
                                onClick={() => {
                                    window.open(result.url, '_blank');
                                }}
                                key={result.id} style={{ marginBottom: 8,
                                background: token.colorFillAlter,
                                borderRadius: token.borderRadiusLG,
                                padding: '8px 12px',
                                cursor: 'pointer',
                                gap: 4,
                                fontSize: 12
                             }}>
                                <Text 
                                    style={{
                                        fontSize: 13
                                    }}
                                    strong>{result.title}</Text>
                                <Text style={{
                                    fontSize: 12
                                }} type="secondary">{result.snippet}</Text>
                            </Flexbox>
                        ))}
                    </Collapse.Panel>
                </Collapse>
            )}

            {currentText?.reasoningUpdate && (
                <>
                    <Button
                        type="text"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px 8px',
                            background: token.colorFillAlter,
                            borderRadius: token.borderRadiusLG,
                            marginBottom: showThinking ? 8 : 0
                        }}
                        onClick={() => setShowThinking(!showThinking)}
                    >
                        <Text strong>深度思考</Text>
                        {showThinking ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </Button>
                    {showThinking && (
                        <div
                            style={{
                                background: token.colorFillAlter,
                                borderRadius: token.borderRadiusLG,
                                padding: '8px 12px',
                                marginBottom: 12
                            }}
                        >
                            <Markdown
                                allowHtml
                                enableMermaid
                                enableImageGallery
                                enableLatex
                                showFootnotes
                                variant='chat'
                                fullFeaturedCodeBlock
                            >
                                {`> ${currentText?.reasoningUpdate.split('\n').join('\n> ')}`}
                            </Markdown>
                        </div>
                    )}
                </>
            )}

            <Markdown
                allowHtml
                enableMermaid
                enableImageGallery
                enableLatex
                showFootnotes
                variant='chat'
                fullFeaturedCodeBlock
                rehypePlugins={[rehypeKatex]}
                remarkPlugins={[remarkMath]}
            >
                {currentText?.text}
            </Markdown>
            {
                chatMessage.files?.map((file: any, index: number) => {
                    return renderFile(file, index)
                })
            }
        </>
    }

    const formatResponseTime = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
        return `${(ms / 60000).toFixed(2)}分钟`;
    };

    const renderModelUsages = (modelUsages: any) => {
        if (!modelUsages) return null;
        return (
            <Flexbox horizontal gap={8} style={{ fontSize: '12px', color: token.colorTextSecondary }}>
                <span>提示词: {modelUsages.promptTokens}</span>
                <span>完成词: {modelUsages.completeTokens}</span>
                <span>响应时间: {formatResponseTime(modelUsages.responseTime)}</span>
            </Flexbox>
        );
    };


    return <Bubble.List
        autoScroll
        items={messages
            // 过滤相同id
            .filter((chatMessage: any, index: number) => {
                return index === 0 || chatMessage.id !== messages[index - 1].id;
            })
            ?.map((chatMessage: any, index: number) => {
            const isEditing = chatMessage.id === editingMessageId;
            return {
                role: chatMessage.role,
                id: 'bubble-list-item' + chatMessage.id,
                style: {
                    background: token.colorBgContainer,
                    borderRadius: token.borderRadiusLG,
                    padding: '8px 12px',
                    marginBottom: 12
                },
                content: isEditing ? (
                    <Input.TextArea
                        value={editingText}
                        style={{
                            fontSize: 14,
                            width: '100%',
                            minWidth: '50vw',
                        }}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => handleSaveEdit(chatMessage.id)}
                        autoSize={{ minRows: 3, maxRows: 10 }}
                    />
                ) : (
                    renderContent(chatMessage)
                ),
                avatar: <Avatar src={chatMessage.role === 'user' ? user?.avatar : '/logo.png'} />,
                header: chatMessage.role === 'user' ? user?.displayName : 'AI助手',
                footer: <Flexbox gap={8}>
                    {renderModelUsages(chatMessage.modelUsages)}
                    {/* <Flexbox
                        horizontal
                        gap={2}
                        style={{ fontSize: '12px', alignItems: 'center' }}
                    >
                        <Button
                            color="default"
                            variant="text"
                            size="small"
                            icon={<ChevronLeft size={14} />}
                            onClick={() => {
                                if (chatMessage.currentIndex === 0) return;
                                chatMessage.currentIndex = chatMessage.currentIndex - 1;
                                setMessages(messages);
                            }}
                            disabled={chatMessage.currentIndex === 0}
                            style={{ minWidth: '20px', height: '20px', padding: 0 }}
                        />
                        <span>{`${(chatMessage.currentIndex ?? chatMessage.texts.length - 1) + 1}/${chatMessage.texts.length}`}</span>
                        <Button
                            color="default"
                            variant="text"
                            size="small"
                            icon={<ChevronRight size={14} />}
                            onClick={() => {
                                chatMessage.currentIndex = chatMessage.currentIndex + 1
                                setMessages(messages)
                            }}
                            disabled={chatMessage.currentIndex === chatMessage.texts.length - 1}
                            style={{ minWidth: '20px', height: '20px', padding: 0 }}
                        />
                    </Flexbox> */}
                    <Flexbox
                        horizontal
                        gap={5}
                    >
                        {isEditing ? (
                            <Button color="default" variant="text" size="small" icon={<CloseOutlined />} onClick={handleCancelEdit} />
                        ) : (
                            <Button color="default" variant="text" size="small" icon={<EditOutlined />} onClick={() => handleEditMessage(chatMessage.id)} />
                        )}
                        <Tooltip title={'删除当前消息'}>
                            <Popconfirm
                                title="确定删除吗？"
                                onConfirm={async () => {
                                    await deleteMessage(chatMessage.id);
                                    setMessages(messages.filter((message: any) => message.id !== chatMessage.id));
                                }}
                            >
                                <Button color="red" variant="text" size="small" icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </Tooltip>
                        {/* 如果是最后一条消息显示 */}
                        {index === messages.length - 1 && (
                            <Tooltip title={chatMessage.role === 'user' ? '重新生成' : '删除并且重新生成'}>
                                <Button
                                    onClick={async () => {
                                        await regenerateMessage(chatMessage.id);
                                    }}
                                    color="default" variant="text" size="small" icon={<SyncOutlined />} />
                            </Tooltip>)}

                        <Tooltip title={'复制源码'}>
                            <Button color="default"
                                onClick={() => {
                                    navigator.clipboard.writeText(chatMessage.texts[0].text).then(() => {
                                        message.success('复制成功');
                                    }).catch(() => {
                                        // 创建input
                                        const input = document.createElement('input');
                                        input.value = chatMessage.texts[0].text;
                                        document.body.appendChild(input);
                                        input.select();
                                        document.execCommand('copy');
                                        document.body.removeChild(input);
                                        message.success('复制成功');
                                    });
                                }}
                                variant="text" size="small" icon={<CopyOutlined />} />
                        </Tooltip>
                    </Flexbox>
                </Flexbox>
            }
        })}
        style={{
            transition: 'width 0.3s',
            overflowY: 'auto',
            width: '100%',
            margin: 8,
            flex: 1,
        }} >
    </Bubble.List>
}