import { Flexbox } from 'react-layout-kit';
import { Attachments, Sender } from '@ant-design/x';
import { Button, Dropdown, GetRef, Space,} from 'antd';
import React from 'react';
import SenderHeader from './SenderHeader';
import { LinkOutlined } from '@ant-design/icons';
import { useChatStore } from '@/store/chat';
import { MoonStar, SendHorizontal, User, MessagesSquare } from 'lucide-react';

export default function ChatInput() {
    const items = [
        {
            key: 'create-user',
            label: '创建用户消息',
            icon: <User />,
            onClick: () => {
                createUserMessage();
            }
        },
        {
            key: 'create-assistant',
            label: '创建助手消息',
            icon: <MessagesSquare />,
            onClick: () => {
                createAssistantMessage();
            }
        },
        {
            key: 'optimize-prompt',
            label: '优化提示词',
            icon: <MoonStar />,
            onClick: () => {
                optimizeCurrentInputPrompt();
            }
        }
    ];

    const attachmentsRef = React.useRef<GetRef<typeof Attachments>>(null);
    const senderRef = React.useRef<GetRef<typeof Sender>>(null);
    const [value, updateValue, fileExpanded, setFileExpanded, createMessageAndSend, currentSession, generateLoading, optimizeCurrentInputPrompt,createUserMessage,createAssistantMessage]
        = useChatStore(state => [state.value,
        state.updateValue,
        state.fileExpanded,
        state.setFileExpanded,
        state.createMessageAndSend,
        state.currentSession,
        state.generateLoading,
        state.optimizeCurrentInputPrompt,
        state.createUserMessage,
        state.createAssistantMessage
    ]);


    return (
        <Flexbox style={{
            maxHeight: 280,
            margin: '10px 10px 5px 10px',
        }}
        >
            <Sender
                ref={senderRef}
                header={<SenderHeader
                    attachmentsRef={attachmentsRef}
                    senderRef={senderRef}
                />}
                prefix={
                    <Button
                        type="text"
                        icon={<LinkOutlined />}
                        onClick={() => {
                            setFileExpanded(!fileExpanded);
                        }}
                    />
                }
                value={value}
                onChange={updateValue}
                onPasteFile={(file) => {
                    attachmentsRef.current?.upload(file);
                    setFileExpanded(true);
                }}
                placeholder='嗨，欢迎您使用Owl智能助手，在这里您可以输入任何您想要了解的问题，Owl将为您提供最专业的解答。'
                loading={generateLoading}
                onSubmit={async () => {
                    await createMessageAndSend({
                        sessionId: currentSession?.id,
                        value: value ?? ''
                    });
                }}
                actions={
                    <Space>
                        <Dropdown.Button
                            type='text'
                            loading={generateLoading}
                            menu={{
                                items,
                            }}>
                            {!generateLoading && (
                                <SendHorizontal
                                    onClick={async () => {
                                        await createMessageAndSend({
                                            sessionId: currentSession?.id,
                                            value: value ?? ''
                                        });
                                    }}
                                    style={{
                                        fontSize: 16,
                                    }}
                                />)}
                        </Dropdown.Button>
                    </Space>
                }
            />
        </Flexbox>
    )
}