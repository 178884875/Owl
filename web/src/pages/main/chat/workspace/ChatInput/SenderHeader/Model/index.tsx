import { Button, Dropdown, Tooltip } from "antd";
import { useEffect } from "react";

import { Flexbox } from "react-layout-kit";
import { getIconByName } from "@/utils/iconutil";
import { BrainCog } from "lucide-react";
import { MenuItemGroupType } from "antd/es/menu/interface";
import ModelFeatureTags from "../../../../../../../features/ModelFeatureTags";
import { useChatStore } from "@/store/chat";
import { theme } from "antd";
const { useToken } = theme;


export default function Model() {
    const { token } = useToken();
    const [loadModels, models, switchSessionModel, currentSession]
        = useChatStore(state => [state.loadChatModels, state.chatModels, state.switchSessionModel, state.currentSession]);

    useEffect(() => {
        loadModels();
    }, []);

    return (
        <Tooltip
            title="选择对话模型"
        >
            <Dropdown
                trigger={['click']}
                menu={{
                    style: {
                        maxHeight: 300,
                        overflow: 'auto',
                    },
                    items: models?.map((model) => ({
                        // 第一层是分组
                        label: model.provider,
                        type: 'group',
                        children: model.models?.map((chatModel: any) => ({
                            label:
                                <Flexbox
                                    horizontal
                                    style={{
                                        fontSize: 16,
                                    }}
                                > <Tooltip
                                    placement="topLeft"
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
                                backgroundColor: chatModel.id === currentSession?.model ? token.controlItemBgActiveHover : 'transparent',
                            },
                            onClick: () => {
                                switchSessionModel(chatModel.id);
                            },
                            icon: getIconByName(model.provider, 22),
                        })),
                    })) as MenuItemGroupType[] || [],
                }}
            >
                <Button
                    type="text"
                    shape="circle"
                    size='small'
                >
                    <BrainCog size={14}/>
                </Button>
            </Dropdown>
        </Tooltip>
    )
}