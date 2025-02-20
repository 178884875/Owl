import { useChatStore } from '@/store/chat';
import { Flexbox } from 'react-layout-kit';
import { getMessages } from '@/apis/Message';
import { useEffect } from 'react';
import { Bubble } from '@ant-design/x';
import { Avatar, Button, message, Popconfirm, Tooltip } from 'antd';
import { useUserStore } from '@/store/user';
import { SyncOutlined, CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Markdown } from '@lobehub/ui';
import { deleteMessage } from '@/apis/Message';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ChatList() {
    const [
        messages,
        setMessages,
        currentSession,
        regenerateMessage
    ] =
        useChatStore(state => [state.messages, state.setMessages, state.currentSession, state.regenerateMessage]);

    const user = useUserStore(state => state.user);

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

    return <Bubble.List
        autoScroll
        items={messages?.map((chatMessage: any, index: number) => {
            return {
                role: chatMessage.role,
                id: 'bubble-list-item' + chatMessage.id,
                content: <Markdown
                    style={{
                        width: '100%',
                        flex: 1,
                    }}
                    allowHtml
                    headerMultiple={0.8}
                    enableMermaid
                    enableImageGallery
                    enableLatex
                    variant='chat'
                    fullFeaturedCodeBlock
                >{chatMessage.texts[chatMessage.currentIndex ?? chatMessage.texts.length - 1].text}</Markdown>,
                avatar: <Avatar src={chatMessage.role === 'user' ? user?.avatar : '/logo.png'} />,
                header: chatMessage.role === 'user' ? user?.displayName : 'AI助手',
                footer: <Flexbox>
                    <Flexbox
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
                                chatMessage.currentIndex = chatMessage.currentIndex + 1;
                                setMessages(messages);
                            }}
                            disabled={chatMessage.currentIndex === chatMessage.texts.length - 1}
                            style={{ minWidth: '20px', height: '20px', padding: 0 }}
                        />
                    </Flexbox>
                    <Flexbox
                        horizontal
                        gap={5}
                    >
                        <Button color="default" variant="text" size="small" icon={<EditOutlined />} />
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
                        <Tooltip title={chatMessage.role === 'user' ? '重新生成' : '删除并且重新生成'}>
                            <Button
                                onClick={async () => {
                                    await regenerateMessage(chatMessage.id);
                                }}
                                color="default" variant="text" size="small" icon={<SyncOutlined />} />
                        </Tooltip>
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