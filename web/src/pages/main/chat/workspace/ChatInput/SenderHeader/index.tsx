import { Attachments, Sender } from "@ant-design/x";
import { GetRef } from "antd";
import React from "react";
import { CloudUploadOutlined } from '@ant-design/icons';
import { SenderRef } from "@ant-design/x/es/sender";
import { Flexbox } from "react-layout-kit";
import { useChatStore } from "@/store/chat";
import Model from "./Model";

export interface SenderHeaderProps {
    senderRef: React.RefObject<SenderRef | null>
    attachmentsRef: React.RefObject<GetRef<typeof Attachments> | null>
}

export default function SenderHeader({
    senderRef,
    attachmentsRef
}: SenderHeaderProps) {
    const [files, setFiles, setFileExpanded, fileExpanded]
        = useChatStore(state => [state.files, state.setFiles, state.setFileExpanded, state.fileExpanded]);

    return (
        <Sender.Header
            styles={{
                content: {
                    padding: 0,
                },
            }}
            closable={false}
            open={true}
            onOpenChange={setFileExpanded}
            forceRender
            title={
                <Flexbox
                    horizontal
                >
                    <Model/>
                </Flexbox>
            }

        >
            {fileExpanded && (
            <Attachments
                ref={attachmentsRef}
                beforeUpload={() => false}
                items={files}
                onChange={({ fileList }) => setFiles(fileList)}
                placeholder={(type) =>
                    type === 'drop'
                        ? {
                            title: 'Drop file here',
                        }
                        : {
                            icon: <CloudUploadOutlined />,
                            title: '上传图片',
                            description: '点击或拖拽文件到这里上传',
                        }
                }
                getDropContainer={() => senderRef.current?.nativeElement}
            />)}
        </Sender.Header>
    );
}