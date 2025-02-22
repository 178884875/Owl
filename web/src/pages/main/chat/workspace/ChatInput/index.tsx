import { Flexbox } from 'react-layout-kit';
import { Attachments, Sender } from '@ant-design/x';
import { Button, GetRef } from 'antd';
import React from 'react';
import SenderHeader from './SenderHeader';
import { LinkOutlined } from '@ant-design/icons';
import { useChatStore } from '@/store/chat';

export default function ChatInput() {

    const attachmentsRef = React.useRef<GetRef<typeof Attachments>>(null);
    const senderRef = React.useRef<GetRef<typeof Sender>>(null);
    const [value, updateValue, files, setFiles, fileExpanded, setFileExpanded, createMessageAndSend, currentSession, generateLoading]
        = useChatStore(state => [state.value,
        state.updateValue,
        state.files,
        state.setFiles,
        state.fileExpanded,
        state.setFileExpanded,
        state.createMessageAndSend,
        state.currentSession,
        state.generateLoading]);

    return (
        <Flexbox style={{
            maxHeight: 280,
            margin: '10px 10px 5px 10px',
        }}

            horizontal
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
                loading={generateLoading}
                onSubmit={async () => {
                    await createMessageAndSend({
                        sessionId: currentSession?.id,
                        value: value ?? ''
                    });
                }}
            />
        </Flexbox>
    )
}