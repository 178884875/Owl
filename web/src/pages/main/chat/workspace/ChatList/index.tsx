import { useChatStore } from '@/store/chat';
import { Flexbox } from 'react-layout-kit';
import { getMessages, updateMessage } from '@/apis/Message';
import { useEffect, useState } from 'react';
import { Bubble } from '@ant-design/x';
import { Avatar, Button, message, Popconfirm, Tooltip, Input } from 'antd';
import { useUserStore } from '@/store/user';
import { SyncOutlined, CopyOutlined, DeleteOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';
import { deleteMessage } from '@/apis/Message';
import { theme } from 'antd';
import { UpdateMessage } from '@/types/Message';
import ChatWelcome from '../ChatWelcome';
import ChatItem from './ChatItem';

export default function ChatList() {
    const { token } = theme.useToken();
    const [
        messages,
        setMessages,
        currentSession,
        regenerateMessage,
        setCodeRendering,
        generateLoading
    ] =
        useChatStore(state => [state.messages, state.setMessages, state.currentSession, state.regenerateMessage, state.setCodeRendering, state.generateLoading]);

    const user = useUserStore(state => state.user);

    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');

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


    const formatResponseTime = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
        return `${(ms / 60000).toFixed(2)}分钟`;
    };
    // Calculate tokens per second based on completion tokens and response time
    const calculateTokensPerSecond = (completeTokens: number, responseTimeMs: number): number => {
        // Convert milliseconds to seconds
        const responseTimeSeconds = responseTimeMs / 1000;

        // Avoid division by zero
        if (responseTimeSeconds <= 0) return 0;

        // Calculate tokens per second
        const tokensPerSecond = completeTokens / responseTimeSeconds;

        // Return with two decimal precision
        return Math.round(tokensPerSecond * 100) / 100;
    };

    // Update the renderModelUsages function to include tokens per second
    const renderModelUsages = (modelUsages: any) => {
        if (!modelUsages) return null;

        // Calculate tokens per second
        const tokensPerSecond = calculateTokensPerSecond(
            modelUsages.completeTokens,
            modelUsages.responseTime
        );

        return (
            <Flexbox horizontal gap={8} style={{ fontSize: '12px', color: token.colorTextSecondary }}>
                <span>提示词: {modelUsages.promptTokens}</span>
                <span>完成词: {modelUsages.completeTokens}</span>
                <span>响应时间: {formatResponseTime(modelUsages.responseTime)}</span>
                <span>速率: {tokensPerSecond} tokens/s</span>
            </Flexbox>
        );
    };

    useEffect(() => {
        if (messages.length === 0) return;
        const lastMessage = messages[messages.length - 1];
        const currentText = lastMessage.texts[lastMessage.currentIndex ?? lastMessage.texts.length - 1].text;
        const codeBlocks = getCodeBlocks(currentText);
        if (codeBlocks.length > 0 ) {
            setCodeRendering({
                visible: generateLoading,
                index: 0,
                items: codeBlocks.map((codeBlock) => ({
                    language: codeBlock.language,
                    code: codeBlock.code,
                    title: codeBlock.fileName,
                    description: codeBlock.description
                }))
            });
        } else {
            setCodeRendering({
                visible: false,
                index: 0,
                items: []
            });
        }
    }, [messages, generateLoading]); 
    
    /**
     * 解析accumulatedText代码块，得到代码中所有的代码块，并且提取```csharp|[BubbleSort.cs:实现冒泡排序算法] 这种格式的信息
     * @param state ChatState
     * @param accumulatedText 包含代码块的文本
     * @returns 解析后的代码块信息数组
     */
    const getCodeBlocks = (accumulatedText: string) => {
        if (!accumulatedText) return [];
        
        const result = [];
        
        try {
            // 首先尝试匹配完整的代码块
            const completeCodeBlockRegex = /```([\w\+\#]+)?\|?\[?([^\]:\n]*):?([^\]\n]*)\]?(?:\n|\s)([\s\S]*?)```/g;
            let match;
            let lastIndex = 0;

            // 处理完整的代码块
            while ((match = completeCodeBlockRegex.exec(accumulatedText)) !== null) {
                const [fullMatch, language, fileName, description, code] = match;
                lastIndex = completeCodeBlockRegex.lastIndex;

                result.push({
                    language: language || 'text', // 如果没有指定语言，默认为text
                    fileName: fileName || '',
                    description: description || '',
                    code: code.trim(),
                    fullMatch,
                    isComplete: true
                });
            }

            // 检查是否有未完成的代码块（只有开始标记，没有结束标记）
            // 查找最后一个 ``` 开始的代码块
            const remainingText = accumulatedText.slice(lastIndex);
            const lastCodeBlockStart = remainingText.lastIndexOf('```');
            
            if (lastCodeBlockStart !== -1) {
                // 找到了可能的未完成代码块
                const incompleteBlockText = remainingText.slice(lastCodeBlockStart);
                // 使用更简单的正则表达式来匹配未完成的代码块头部
                const headerRegex = /```([\w\+\#]+)?\|?\[?([^\]:\n]*):?([^\]\n]*)\]?(?:\n|\s)/;
                const headerMatch = headerRegex.exec(incompleteBlockText);
                
                if (headerMatch) {
                    const [_, language, fileName, description] = headerMatch;
                    // 提取代码部分 (去掉头部后的所有内容)
                    const code = incompleteBlockText.slice(headerMatch[0].length);
                    
                    result.push({
                        language: language || 'text',
                        fileName: fileName || '',
                        description: description || '',
                        code: code.trim(),
                        fullMatch: incompleteBlockText,
                        isComplete: false
                    });
                }
            }
        } catch (error) {
            console.error('解析代码块时出错:', error);
            // 出错时返回已解析的结果，不中断流程
        }

        return result;
    }


    if (messages.length === 0) {
        return <ChatWelcome />
    }

    return <Bubble.List
        autoScroll
        items={messages
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
                        marginBottom: 12,
                        marginRight: 12
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
                        <ChatItem chatMessage={chatMessage} />
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