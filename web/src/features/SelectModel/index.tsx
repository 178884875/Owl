import { Select, Tooltip } from "antd";
import { useEffect } from "react";

import { Flexbox } from "react-layout-kit";
import { getIconByName } from "@/utils/iconutil";
import ModelFeatureTags from "../ModelFeatureTags";
import { useChatStore } from "@/store/chat";
import { theme } from "antd";
const { useToken } = theme;

interface SelectModelProps {
    children: React.ReactNode;
    modelIds: string[];
    onSelect: (modelIds: string[]) => void;
}

export default function SelectModel({ children, modelIds, onSelect }: SelectModelProps) {
    const { token } = useToken();
    const [loadModels, models] = useChatStore(state => [state.loadModels, state.models]);

    useEffect(() => {
        loadModels();
    }, []);

    return (
        <div style={{
            width: "100%",
            height: "100%",
            overflow: "auto",
        }}>
            <Select
                style={{ width: "100%" }}
                dropdownStyle={{
                    maxHeight: 300,
                    overflow: "auto",
                }}
                placeholder={children}
                mode='tags'
                value={modelIds}
                onChange={(value: string[]) => {
                    value = value.filter(x => x !== '' && x !== undefined);
                    console.log(value);
                    
                    if (value.length === 0) {
                        onSelect([]);
                    } else {
                        onSelect(value);
                    }
                }}
            >

                {models?.map((model) => (
                    <Select.OptGroup
                        key={model.provider}
                        label={model.provider}
                    >
                        {model.chatModels?.map((chatModel: any) => (
                            <Select.Option
                                key={chatModel.id}
                                value={chatModel.id}
                                label={
                                    <Flexbox
                                        horizontal
                                        style={{
                                            fontSize: 16,
                                        }}
                                    >
                                        <Tooltip
                                            placement="right"
                                            title={chatModel.description}
                                        >
                                            <div
                                                style={{
                                                    flex: 1,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    marginLeft: 5,
                                                }}
                                            >
                                                {chatModel.displayName}
                                            </div>
                                        </Tooltip>
                                        <ModelFeatureTags
                                            tokens={chatModel.contextWindowTokens}
                                            vision={chatModel.vision}
                                            functionCall={chatModel.functionCall}
                                        />
                                    </Flexbox>
                                }
                                style={{
                                    backgroundColor: modelIds.includes(chatModel.id)
                                        ? token.controlItemBgActiveHover
                                        : "transparent",
                                }}
                            >
                                <Flexbox
                                    horizontal
                                    style={{ alignItems: "center" }}
                                >
                                    {getIconByName(model.provider, 22)}
                                    <span
                                        style={{
                                            marginLeft: 8,
                                            flex: 1,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {chatModel.displayName}
                                    </span>
                                </Flexbox>
                            </Select.Option>
                        ))}
                    </Select.OptGroup>
                ))}
            </Select>
        </div>
    );
}