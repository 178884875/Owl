import { useChatStore } from "@/store/chat";
import { Code, X, Copy, Download, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button, theme, Typography, message, } from "antd";
import { Highlighter } from "@lobehub/ui";
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { Flexbox } from "react-layout-kit";
const { Text } = Typography;
const { useToken } = theme;

export default function CodeRendering() {
    const [codeRendering, setCodeRendering] = useChatStore((state) => [state.codeRendering, state.setCodeRendering]);
    const { token } = useToken();

    if (!codeRendering.visible) {
        return null;
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(codeRendering.items[codeRendering.index].code)
            .then(() => {
                message.success('代码已复制到剪贴板');
            })
            .catch(() => {
                message.error('复制失败');
            });
    }

    const handleDownload = () => {
        const blob = new Blob([codeRendering.items[codeRendering.index].code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = codeRendering.items[codeRendering.index].title;
        a.click();
        URL.revokeObjectURL(url);
        message.success('代码已下载');
    }

    if (codeRendering.items?.length === 0 || !codeRendering.items[codeRendering.index]) {
        return null;
    }

    return (
        <div
            className="code-floating-window"
            style={{
                position: 'fixed',
                top: 20,
                right: 20,
                width: '40%',
                height: '80vh',
                backgroundColor: token.colorBgContainer,
                borderRadius: token.borderRadiusLG,
                boxShadow: token.boxShadowSecondary,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                overflow: 'hidden',
                border: `1px solid ${token.colorBorderSecondary}`
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
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Code size={16} style={{ marginRight: token.marginXS, color: token.colorTextSecondary }} />
                    <Text strong>{codeRendering.items[codeRendering.index]?.title}</Text>
                    {codeRendering.items[codeRendering.index]?.description && (
                        <Text type="secondary" style={{ marginLeft: token.marginXS, fontSize: token.fontSizeSM }}>
                            {codeRendering.items[codeRendering.index].description}
                        </Text>
                    )}
                </div>
                <Button
                    type="text"
                    icon={<X size={16} />}
                    onClick={() => setCodeRendering({ 
                        ...codeRendering,
                        visible: false,
                        index: 0
                    })}
                    style={{ marginRight: -8 }}
                />
            </div>
            <Highlighter
                style={{
                    height: '100%',
                    flex: 1,
                    ...vscDarkPlus as any
                }}
                language={codeRendering.items[codeRendering.index]?.language}
            >
                {codeRendering.items[codeRendering.index]?.code}
            </Highlighter>
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
                        }}
                        icon={<ArrowLeft size={16} />} />
                    <Text>{codeRendering.index + 1}/{codeRendering.items.length}</Text>
                    <Button type="text"
                        size="small"
                        disabled={codeRendering.index === codeRendering.items.length - 1}
                        onClick={() => {
                            setCodeRendering({ ...codeRendering, index: codeRendering.index + 1 });
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
