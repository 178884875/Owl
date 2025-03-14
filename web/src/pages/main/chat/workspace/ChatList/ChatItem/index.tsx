import { Image, Button, Card, Collapse, Spin, theme, Typography } from "antd";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Flexbox } from "react-layout-kit";


import { FileMarkdownOutlined, FileTextOutlined } from '@ant-design/icons';
import MarkdownIRender from "@/components/MarkdownIRender";

const { Text } = Typography;

const { useToken } = theme;

interface ChatItemProps {
    chatMessage: any;
}

export default function ChatItem({ chatMessage }: ChatItemProps) {
    const { token } = useToken(); // 如果消息是...则显示加载

    const [showThinking, setShowThinking] = useState(true);

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
                            key={result.id} style={{
                                marginBottom: 8,
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
                        <MarkdownIRender
                            content={`> ${currentText?.reasoningUpdate.split('\n').join('\n> ')}`}
                        />
                    </div>
                )}
            </>
        )}

        <MarkdownIRender
            content={currentText?.text}
        />

        {
            chatMessage.files?.map((file: any, index: number) => {
                return renderFile(file, index)
            })
        }
    </>
}
