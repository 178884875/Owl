import { useChatStore } from "@/store/chat";
import { Code, X, Copy, Download, ArrowLeft, ArrowRight, Eye, Maximize, Minimize } from 'lucide-react';
import { Button, theme, Typography, message } from "antd";
import { Highlighter } from "@lobehub/ui";
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';
import CodePreview from './CodePreview';

import { Flexbox } from "react-layout-kit";
const { Text } = Typography;
const { useToken } = theme;

export default function CodeRendering() {
    const [codeRendering, setCodeRendering] = useChatStore((state) => [state.codeRendering, state.setCodeRendering]);
    const { token } = useToken();
    const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
    const [isMaximized, setIsMaximized] = useState(false);

    if (!codeRendering.visible) {
        return null;
    }

    if (!codeRendering.items || codeRendering.items.length === 0 ||
        codeRendering.index < 0 || codeRendering.index >= codeRendering.items.length ||
        !codeRendering.items[codeRendering.index]) {
        console.warn('CodeRendering: 数据不完整，无法显示代码窗口', codeRendering);
        return null;
    }


    const currentItem = codeRendering.items[codeRendering.index];
    const isHtml = currentItem.language === 'html' ||
        (currentItem.fileName && currentItem.fileName.toLowerCase().endsWith('.html')) || currentItem.language === 'jsx' || currentItem.language === 'vue';

    const handleCopy = () => {
        navigator.clipboard.writeText(currentItem.code)
            .then(() => {
                message.success('代码已复制到剪贴板');
            })
            .catch(() => {
                message.error('复制失败');
            });
    }

    const handleDownload = () => {
        const blob = new Blob([currentItem.code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentItem.fileName;
        a.click();
        URL.revokeObjectURL(url);
        message.success('代码已下载');
    }

    const togglePreview = () => {
        if (viewMode === 'code') {
            setViewMode('preview');
        } else {
            setViewMode('code');
        }
    };

    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    const renderContent = () => {
        if (isHtml && viewMode === 'preview') {
            return (
                <CodePreview 
                    code={currentItem.code}
                    fileName={currentItem.fileName}
                    language={currentItem.language}
                />
            );
        }

        return (
            <Highlighter
                style={{
                    height: '100%',
                    flex: 1,
                    ...vscDarkPlus as any
                }}
                language={currentItem.language}
            >
                {currentItem.code}
            </Highlighter>
        );
    };

    return (
        <div
            className="code-floating-window"
            style={{
                position: 'fixed',
                top: isMaximized ? 0 : 20,
                right: isMaximized ? 0 : 20,
                left: isMaximized ? 0 : 'auto',
                bottom: isMaximized ? 0 : 'auto',
                width: isMaximized ? '100%' : '40%',
                height: isMaximized ? '100vh' : '80vh',
                backgroundColor: token.colorBgContainer,
                borderRadius: isMaximized ? 0 : token.borderRadiusLG,
                boxShadow: token.boxShadowSecondary,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                overflow: 'hidden',
                border: isMaximized ? 'none' : `1px solid ${token.colorBorderSecondary}`,
                transition: 'all 0.3s ease'
            }}
        >
            <div style={{
                padding: `${token.paddingXS}px ${token.padding}px`,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: token.colorBgElevated
            }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Button
                        type={'text'}
                        size="small"
                        title={isMaximized ? '还原窗口' : '最大化窗口'}
                        onClick={toggleMaximize}
                    >
                        {isMaximized ? <Minimize size={14} /> : <Maximize size={14} />}
                    </Button>
                    <Text strong>{currentItem.fileName}</Text>
                </div>

                <Flexbox horizontal gap={token.marginXS} style={{ marginRight: token.margin }}>
                    {isHtml && (
                        <Button
                            type={'text'}
                            size="small"
                            title={viewMode === 'code' ? '预览HTML' : '查看代码'}
                            style={{ color: viewMode === 'preview' ? token.colorPrimary : token.colorTextSecondary }}
                            onClick={togglePreview}
                        >
                            {viewMode === 'code' ? <Eye size={14} /> : <Code size={14} />}
                        </Button>
                    )}
                </Flexbox>

                <Button
                    type="text"
                    icon={<X size={16} />}
                    onClick={() => setCodeRendering({
                        ...codeRendering,
                        visible: false,
                        index: 0
                    })}
                />
            </div>

            {renderContent()}

            <div style={{
                padding: `${token.paddingXS}px ${token.padding}px`,
                borderTop: `1px solid ${token.colorBorderSecondary}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: token.colorBgElevated
            }}>
                <Flexbox style={{
                    flex: 1,
                }} gap={token.marginXS} align="center" horizontal>
                    <Button type="text"
                        size="small"
                        disabled={codeRendering.index === 0}
                        onClick={() => {
                            setCodeRendering({ ...codeRendering, index: codeRendering.index - 1 });
                            setViewMode('code'); // 切换文件时重置为代码视图
                            setIsMaximized(false); // 切换文件时取消最大化
                        }}
                        icon={<ArrowLeft size={16} />} />
                    <Text>{codeRendering.index + 1}/{codeRendering.items.length}</Text>
                    <Button type="text"
                        size="small"
                        disabled={codeRendering.index === codeRendering.items.length - 1}
                        onClick={() => {
                            setCodeRendering({ ...codeRendering, index: codeRendering.index + 1 });
                            setViewMode('code'); // 切换文件时重置为代码视图
                            setIsMaximized(false); // 切换文件时取消最大化
                        }}
                        icon={<ArrowRight size={16} />} />
                </Flexbox>
                <Flexbox gap={token.marginXS} align="center" horizontal>
                    <Button type="text"
                        size="small"
                        onClick={handleCopy}
                        icon={<Copy size={16} />} />
                    <Button
                        onClick={handleDownload}
                        type="text"
                        icon={<Download size={16} />}
                    />
                </Flexbox>
            </div>
        </div>
    );
}
