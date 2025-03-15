import ReactMarkdown from 'react-markdown';
import {  theme } from 'antd';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Highlighter } from '@lobehub/ui';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Typography, Divider } from 'antd';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import './styles.css';
import { useChatStore } from '@/store/chat';
import { Code } from 'lucide-react';
import { getCodeBlocks } from '@/utils/render';
const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

interface MarkdownIRenderProps {
    content: string;
    className?: string;
}

export default function MarkdownIRender({ content, className }: MarkdownIRenderProps) {
    const { token } = useToken();
    const [setCodeRendering, codeRendering] = useChatStore((state) => [state.setCodeRendering, state.codeRendering]);

    const showCodeWindow = (code: string) => {
        // 标准化代码：移除所有空白字符并转为小写以进行不区分大小写的比较
        const normalizeCode = (text: string) => text.replace(/\s+/g, '')
            .replace(/\n/g, '')
            .replace(/\t/g, '')
            .toLowerCase();
        const normalizedCode = normalizeCode(code);
        const items = getCodeBlocks(content);
        
        const index = items.findIndex(item => 
            normalizeCode(item.code) === normalizedCode
        );
        
        if (index !== -1) {
            setCodeRendering({
                ...codeRendering,
                index,
                items,
                visible: true
            });
        } else {
            // 如果没有找到完全匹配，可以考虑添加一个新项
            console.log('未找到匹配的代码块', code, codeRendering.items);
        }
    };


    return (
        <div className={`markdown-render ${className || ''}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={{
                    h1: ({ node, ...props }) => <Title level={1} {...props} />,
                    h2: ({ node, ...props }) => <Title level={2} {...props} />,
                    h3: ({ node, ...props }) => <Title level={3} {...props} />,
                    h4: ({ node, ...props }) => <Title level={4} {...props} />,
                    h5: ({ node, ...props }) => <Title level={5} {...props} />,
                    h6: ({ node, ...props }) => <Title level={5} {...props} />,

                    // 段落和文本
                    p: ({ node, ...props }) => <Paragraph {...props} />,
                    strong: ({ node, ...props }) => <Text strong {...props} />,
                    em: ({ node, ...props }) => <Text italic {...props} />,
                    del: ({ node, ...props }) => <Text delete {...props} />,

                    // 引用块
                    blockquote: ({ node, ...props }) => <blockquote className="markdown-blockquote" {...props} />,

                    // 链接
                    a: ({ node, ...props }) => <span
                        {...props}
                        onClick={(e) => {
                            e.preventDefault();
                            window.open(props.href, '_blank');
                        }}
                    />,

                    // 分割线
                    hr: () => <Divider />,

                    // 列表
                    ul: ({ node, ...props }) => <ul className="markdown-list" {...props} />,
                    ol: ({ node, ...props }) => <ol className="markdown-list" {...props} />,

                    // 图片
                    img: ({ node, ...props }) => <img
                        src={props.src}
                        alt={props.alt}
                        style={{ maxWidth: '100%', height: 'auto' }}
                        {...props}
                    />,

                    // 表格
                    table: ({ node, ...props }) =>
                        <div className="markdown-table-container">
                            <table className="markdown-table" {...props} />
                        </div>,

                    // 代码块
                    code: ({ node, className, children, ...props }) => {
                        const match = /language-(\w+)(?:\|(\[.*?\]))?.*/i.exec(className || '');

                        if (!match) {
                            return <code className={className} {...props}>
                                {children}
                            </code>
                        }

                        const language = match[1];
                        let codeTitle = '';
                        let codeDescription = '';
                        let shouldHideCode = false;

                        // 解析文件名和描述 [filename.ext:description]
                        if (match[2]) {
                            const titleMatch = /\[(.*?)(?:\:(.*?))?\]/.exec(match[2]);
                            if (titleMatch) {
                                codeTitle = titleMatch[1] || '';
                                codeDescription = titleMatch[2] || '';
                                shouldHideCode = true;
                            }
                        }

                        return (
                            <div style={{ marginBottom: token.marginMD }}>
                                {(codeTitle || codeDescription) && (
                                    <div
                                        style={{
                                            padding: `${token.paddingXS}px ${token.padding}px`,
                                            backgroundColor: token.colorBgContainer,
                                            borderRadius: token.borderRadius,
                                            border: `1px solid ${token.colorBorderSecondary}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => showCodeWindow(String(children))}
                                    >
                                        <Code size={16} style={{ marginRight: token.marginXS, color: token.colorTextSecondary }} />
                                        {codeTitle && (
                                            <Text strong style={{ marginRight: token.marginXS }}>
                                                {codeTitle}
                                            </Text>
                                        )}
                                        {codeDescription && (
                                            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                                                {codeDescription}
                                            </Text>
                                        )}
                                    </div>
                                )}
                                {!shouldHideCode && (
                                    <Highlighter
                                        style={vscDarkPlus as any}
                                        language={language}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </Highlighter>
                                )}
                            </div>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}