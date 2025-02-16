import { useChatStore } from "@/store/chat";
import { getIconByName } from "@/utils/iconutil";
import { Dropdown, message, Modal, Tooltip } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { Flexbox } from "react-layout-kit";
import ModelFeatureTags from "../../chat/workspace/ChatInput/SenderHeader/features/ModelFeatureTags";
import { MenuItemGroupType } from "antd/es/menu/interface";
import { theme } from "antd";
import { useNavigate } from "react-router-dom";

const { useToken } = theme;

export default function CreateSession() {
    const { token } = useToken();
    const navigate = useNavigate();
    const [loadModels, models, visible, setVisible, createSession, value, setValue] =
        useChatStore(state => [state.loadModels, state.models, state.createSessionVisible, state.setCreateSessionVisible, state.createSession, state.value, state.updateValue]);
    const [model, setModel] = useState<string | undefined>();

    useEffect(() => {
        if (visible) {
            setValue('');
            loadModels();
        } else {
            setModel(undefined);
        }
    }, [visible]);

    useEffect(() => {
        if (models && models.length > 0) {
            // 如果存在gpt-4o则设置为他的id，模型id是modelId
            let modelId = models.find(item => item.provider === 'OpenAI')?.chatModels?.find((item: any) => item.modelId === 'gpt-4o')?.id;
            if (!modelId) {
                modelId = models[0].chatModels[0].id;
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
        const result = await createSession(
            {
                modelId: model,
                value: value!,
            }
        );
        setValue('');
        navigate('/chat?sessionId=' + result);
        setVisible(false);
    }

    const renderModel = () => {
        const item = models?.find(item => item.chatModels?.find((chatModel: { id: string | undefined; }) => chatModel.id === model) !== undefined)?.chatModels?.find((chatModel: { id: string | undefined; }) => chatModel.id === model);
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
                        <Flexbox style={{
                            justifyContent: 'flex-end',
                        }}>
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
                                        children: item.chatModels?.map((chatModel: any) => ({
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
                        </Flexbox>

                    </Modal>)
            }
        </>
    )
}