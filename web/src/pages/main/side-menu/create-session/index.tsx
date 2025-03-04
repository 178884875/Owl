import { useChatStore } from "@/store/chat";
import { getIconByName } from "@/utils/iconutil";
import { Dropdown, message, Modal, Tooltip, Button, Image, Card } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState, useRef } from "react";
import { Flexbox } from "react-layout-kit";
import ModelFeatureTags from "../../../../features/ModelFeatureTags";
import { MenuItemGroupType } from "antd/es/menu/interface";
import { theme,Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { CloseOutlined, PaperClipOutlined, CameraOutlined, SendOutlined, FileTextOutlined, FileMarkdownOutlined } from '@ant-design/icons';
import { uploadFile } from "@/apis/FileStorage";

const { Text } = Typography;
const { useToken } = theme;

export default function CreateSession() {
    const { token } = useToken();
    const navigate = useNavigate();
    const [loadModels, models, visible, setVisible, createSession, value, setValue] =
        useChatStore(state => [state.loadModels, state.models, state.createSessionVisible, state.setCreateSessionVisible, state.createSession, state.value, state.updateValue]);
    const [model, setModel] = useState<string | undefined>();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (visible) {
            setValue('');
            loadModels();
            setSelectedImage(null);
            setImagePreview(null);
            setSelectedFiles([]);
        } else {
            setModel(undefined);
        }
    }, [visible]);

    useEffect(() => {
        if (models && models.length > 0) {
            // 如果存在gpt-4o则设置为他的id，模型id是modelId
            let modelId = models.find(item => item.provider === 'OpenAI')?.models?.find((item: any) => item.modelId === 'gpt-4o')?.id;
            if (!modelId && models.length > 0) {
                modelId = models[0].models[0].id;
            }
            setModel(modelId);
        }
    }, [models, visible]);

    const handleCreateSession = async () => {
        if (model === undefined) {
            message.error('请选择模型');
            return;
        }
        if (value === '') {
            message.error('请输入内容');
            return;
        }

        let files: any[] = [];

        // 处理图片文件
        if (selectedImage) {
            const result = await uploadFile(selectedImage);
            if (result.success) {
                files.push({
                    id: result.data.id,
                    fileName: result.data.fileName,
                    path: result.data.path,
                });
            }
        }

        // 处理文本文件
        for (const file of selectedFiles) {
            const result = await uploadFile(file);
            if (result.success) {
                files.push({
                    id: result.data.id,
                    fileName: result.data.fileName,
                    path: result.data.path,
                });
            }
        }

        const result = await createSession(
            {
                modelId: model,
                value: value!,
                files: files
            }
        );
        setValue('');
        navigate('/chat?sessionId=' + result);
        setVisible(false);
    }

    const renderModel = () => {
        const item = models?.find(item => item.models?.find((chatModel: { id: string | undefined; }) => chatModel.id === model) !== undefined)?.models?.find((chatModel: { id: string | undefined; }) => chatModel.id === model);
        return <Flexbox
            horizontal
            style={{
                fontSize: 16,
            }}
        >
            {getIconByName(item?.provider, 26)}
            {item?.displayName}
        </Flexbox>;
    }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleTextFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newFiles = Array.from(files);
            setSelectedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (fileToRemove: File) => {
        setSelectedFiles(prev => prev.filter(file => file !== fileToRemove));
    };

    const triggerTextFileUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.md,.cs,.java,.js,.ts,.py,.go,.php,.ruby,.swift,.sql,.html,.css,.json,.xml,.yaml,.yml,.toml,.ini,.csv,.tsv,.log';
        input.multiple = true;
        input.onchange = (e) => handleTextFileUpload(e as unknown as React.ChangeEvent<HTMLInputElement>);
        input.click();
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                event.preventDefault();
                const blob = items[i].getAsFile();
                if (blob) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        setImagePreview(e.target?.result as string);
                    };
                    reader.readAsDataURL(blob);
                    setSelectedImage(blob);
                }
                break;
            }
        }
    };

    return (
        <>
            {
                visible && (
                    <Modal
                        open={visible}
                        onClose={() => setVisible(false)}
                        closable={false}
                        onCancel={() => setVisible(false)}
                        footer={null}
                    >
                        <TextArea
                            placeholder="今天你想聊点什么？"
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                            }}
                            onPaste={handlePaste}
                            // 回车键
                            onPressEnter={(e) => {
                                // 不处理Shift+Enter
                                if (e.shiftKey) {
                                    return;
                                }
                                // 发送消息
                                handleCreateSession();
                            }}
                            style={{
                                width: '100%',
                                height: 100,
                                marginBottom: 10,
                                resize: 'none',
                                border: 'none',
                                outline: 'none',
                                boxShadow: 'none',
                            }}
                        />
                        
                        <Flexbox horizontal gap={8}>
                            {(imagePreview || selectedFiles.length > 0) && (
                                <>
                                    {imagePreview && (
                                        <div style={{ marginBottom: 8, position: 'relative' }}>
                                            <Image
                                                src={imagePreview}
                                                alt="Preview"
                                                style={{ maxWidth: '180px', maxHeight: 180, objectFit: 'contain' }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<CloseOutlined />}
                                                onClick={removeImage}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    background: 'rgba(255, 255, 255, 0.8)',
                                                }}
                                            />
                                        </div>
                                    )}
                                    {selectedFiles.map((file, index) => (
                                        <Card
                                            key={index}
                                            size="small"
                                            style={{
                                                background: token.colorBgContainer,
                                                width: 'fit-content',
                                                height: 'fit-content',
                                                margin: 5
                                            }}
                                            bodyStyle={{
                                                padding: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8
                                            }}
                                        >
                                            {file.name.endsWith('.md') ? (
                                                <FileMarkdownOutlined style={{ fontSize: 16 }} />
                                            ) : (
                                                <FileTextOutlined style={{ fontSize: 16 }} />
                                            )}
                                            <Text style={{ maxWidth: 200 }} ellipsis={{ tooltip: file.name }}>
                                                {file.name}
                                            </Text>
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<CloseOutlined />}
                                                onClick={() => removeFile(file)}
                                                style={{ padding: 0 }}
                                            />
                                        </Card>
                                    ))}
                                </>
                            )}
                        </Flexbox>

                        <Flexbox style={{
                            justifyContent: 'space-between',
                            marginTop: 8,
                            borderTop: `1px solid ${token.colorBorderSecondary}`,
                            paddingTop: 12
                        }} horizontal>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Tooltip title="添加文本文件 (txt, md, 代码文件)">
                                    <Button
                                        type="text"
                                        icon={<PaperClipOutlined />}
                                        onClick={triggerTextFileUpload}
                                    />
                                </Tooltip>
                                {/* 检查当前选择的模型是否支持视觉功能 */}
                                {models?.find(item => item.models?.find((chatModel: any) => chatModel.id === model))?.models?.find((chatModel: any) => chatModel.id === model)?.vision && (
                                    <Tooltip title="添加图片">
                                        <Button type="text" icon={<CameraOutlined />} onClick={triggerImageUpload} />
                                    </Tooltip>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>

                            <Flexbox horizontal>
                                <Dropdown
                                    trigger={['click']}
                                    menu={{
                                        style: {
                                            maxHeight: 300,
                                            overflow: 'auto',
                                        },
                                        items: models?.map((item) => ({
                                            label: item.provider,
                                            type: 'group',
                                            children: item.models?.map((chatModel: any) => ({
                                                label:
                                                    <Flexbox
                                                        horizontal
                                                        style={{
                                                            fontSize: 16,
                                                        }}
                                                    > <Tooltip
                                                        placement="right"
                                                        title={chatModel.description}>
                                                            <div style={{
                                                                flex: 1,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                marginLeft: 5,
                                                            }}>
                                                                {chatModel.displayName}
                                                            </div>
                                                        </Tooltip>
                                                        <ModelFeatureTags
                                                            tokens={chatModel.contextWindowTokens}
                                                            vision={chatModel.vision}
                                                            functionCall={chatModel.functionCall}
                                                        />
                                                    </Flexbox>,
                                                value: chatModel.id,
                                                key: chatModel.id,
                                                style: {
                                                    backgroundColor: chatModel.id === model ? token.controlItemBgActiveHover : 'transparent',
                                                },
                                                onClick: () => {
                                                    setModel(chatModel.id);
                                                },
                                                icon: getIconByName(item.provider, 22),
                                            })),
                                        })) as MenuItemGroupType[] || [],
                                    }}
                                >
                                    <div style={{
                                        cursor: 'pointer',
                                    }}>
                                        {renderModel()}
                                    </div>
                                </Dropdown>
                                
                                {value && (
                                    <Button
                                        shape="circle"
                                        type="primary"
                                        onClick={handleCreateSession}
                                        style={{
                                            background: token.colorPrimary,
                                            borderColor: token.colorPrimary,
                                            marginLeft: 12
                                        }}
                                    >
                                        <SendOutlined />
                                    </Button>
                                )}
                            </Flexbox>
                        </Flexbox>
                    </Modal>)
            }
        </>
    )
}