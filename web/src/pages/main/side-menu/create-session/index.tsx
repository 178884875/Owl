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
                        width={520}
                        bodyStyle={{
                            padding: '24px',
                            borderRadius: '12px',
                        }}
                    >
                        <Flexbox gap={16}>
                            <TextArea
                                placeholder="今天你想聊点什么？"
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                }}
                                onPaste={handlePaste}
                                onPressEnter={(e) => {
                                    if (e.shiftKey) {
                                        return;
                                    }
                                    handleCreateSession();
                                }}
                                style={{
                                    width: '100%',
                                    height: 120,
                                    marginBottom: 0,
                                    resize: 'none',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '12px 16px',
                                    fontSize: '15px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: 'none',
                                    background: token.colorBgElevated,
                                }}
                                autoFocus
                            />
                            
                            {(imagePreview || selectedFiles.length > 0) && (
                                <Flexbox style={{ 
                                    maxHeight: '200px', 
                                    overflowY: 'auto',
                                    padding: '8px',
                                    background: token.colorBgElevated,
                                    borderRadius: '8px',
                                }}>
                                    <Flexbox horizontal gap={12} wrap="wrap">
                                        {imagePreview && (
                                            <div style={{ 
                                                position: 'relative',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}>
                                                <Image
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    style={{ 
                                                        maxWidth: '180px', 
                                                        maxHeight: 180, 
                                                        objectFit: 'contain',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    icon={<CloseOutlined />}
                                                    onClick={removeImage}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 4,
                                                        right: 4,
                                                        background: 'rgba(0, 0, 0, 0.6)',
                                                        borderColor: 'transparent',
                                                        color: 'white',
                                                        width: '24px',
                                                        height: '24px',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        padding: 0,
                                                        borderRadius: '50%'
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
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                                                    border: `1px solid ${token.colorBorderSecondary}`,
                                                }}
                                                bodyStyle={{
                                                    padding: '8px 12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8
                                                }}
                                            >
                                                {file.name.endsWith('.md') ? (
                                                    <FileMarkdownOutlined style={{ fontSize: 18, color: token.colorPrimary }} />
                                                ) : (
                                                    <FileTextOutlined style={{ fontSize: 18, color: token.colorPrimary }} />
                                                )}
                                                <Text style={{ maxWidth: 180 }} ellipsis={{ tooltip: file.name }}>
                                                    {file.name}
                                                </Text>
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={<CloseOutlined style={{ fontSize: '12px' }} />}
                                                    onClick={() => removeFile(file)}
                                                    style={{ 
                                                        padding: 0,
                                                        width: '20px',
                                                        height: '20px',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        borderRadius: '50%',
                                                        color: token.colorTextSecondary
                                                    }}
                                                />
                                            </Card>
                                        ))}
                                    </Flexbox>
                                </Flexbox>
                            )}

                            <Flexbox style={{
                                justifyContent: 'space-between',
                                borderTop: `1px solid ${token.colorBorderSecondary}`,
                                paddingTop: 16
                            }} horizontal align="center">
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <Tooltip title="添加文本文件 (txt, md, 代码文件)">
                                        <Button
                                            type="text"
                                            icon={<PaperClipOutlined style={{ fontSize: '18px', color: token.colorTextSecondary }} />}
                                            onClick={triggerTextFileUpload}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                borderRadius: '8px',
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    </Tooltip>
                                    {models?.find(item => item.models?.find((chatModel: any) => chatModel.id === model))?.models?.find((chatModel: any) => chatModel.id === model)?.abilities?.vision && (
                                        <Tooltip title="添加图片">
                                            <Button 
                                                type="text" 
                                                icon={<CameraOutlined style={{ fontSize: '18px', color: token.colorTextSecondary }} />} 
                                                onClick={triggerImageUpload}
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    borderRadius: '8px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            />
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

                                <Flexbox horizontal align="center" gap={12}>
                                    <Dropdown
                                        trigger={['click']}
                                        menu={{
                                            style: {
                                                maxHeight: 300,
                                                overflow: 'auto',
                                                borderRadius: '10px',
                                                padding: '8px 0',
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
                                                                vision={chatModel.abilities?.vision}
                                                                functionCall={chatModel.abilities?.functionCall}
                                                            />
                                                        </Flexbox>,
                                                    value: chatModel.id,
                                                    key: chatModel.id,
                                                    style: {
                                                        backgroundColor: chatModel.id === model ? token.controlItemBgActiveHover : 'transparent',
                                                        borderRadius: '6px',
                                                        margin: '2px 6px',
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
                                            padding: '6px 12px',
                                            border: `1px solid ${token.colorBorderSecondary}`,
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            transition: 'all 0.3s ease',
                                            background: token.colorBgContainer,
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
                                                width: '42px',
                                                height: '42px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                transition: 'all 0.3s ease',
                                            }}
                                            icon={<SendOutlined style={{ fontSize: '18px' }} />}
                                        />
                                    )}
                                </Flexbox>
                            </Flexbox>
                        </Flexbox>
                    </Modal>)
            }
        </>
    )
}