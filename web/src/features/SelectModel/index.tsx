import { Dropdown, Tooltip } from "antd";
import { useEffect } from "react";

import { Flexbox } from "react-layout-kit";
import { getIconByName } from "@/utils/iconutil";
import { MenuItemGroupType } from "antd/es/menu/interface";
import ModelFeatureTags from "../ModelFeatureTags";
import { useChatStore } from "@/store/chat";
import { theme } from "antd";
const { useToken } = theme;

interface SelectModelProps {
    children: React.ReactNode;
    modelIds: string[];
    onSelect: (modelId: string) => void;
}

export default function SelectModel({ children, modelIds, onSelect }: SelectModelProps) {
    const { token } = useToken();
    const [loadModels, models]
        = useChatStore(state => [state.loadModels, state.models]);

    useEffect(() => {
        loadModels();
    }, []);

    return (
        <Dropdown
            trigger={['click']}
            menu={{
                style: {
                    maxHeight: 300,
                    overflow: 'auto',
                },
                items: models?.map((model) => ({
                    label: model.provider,
                    type: 'group',
                    children: model.chatModels?.map((chatModel: any) => ({
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
                            backgroundColor: modelIds.includes(chatModel.id) ? token.controlItemBgActiveHover : 'transparent',
                        },
                        onClick: (e: any) => {
                            onSelect(chatModel.id);
                            // 选择以后不隐藏
                            e.stopPropagation();
                        },
                        icon: getIconByName(model.provider, 22),
                    })),
                })) as MenuItemGroupType[] || [],
            }}
        >
            {children}
        </Dropdown>
    )
}