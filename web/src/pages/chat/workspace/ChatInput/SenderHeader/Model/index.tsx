import { Button, Dropdown, Select, Tooltip } from "antd";
import { useState } from "react";

import { Flexbox } from "react-layout-kit";
import type { SelectProps } from 'antd';
import { getIconByName } from "@/utils/iconutil";
import { BrainCog } from "lucide-react";

type LabelRender = SelectProps['labelRender'];

export default function Model() {
    const [search, setSearch] = useState('');
    const [models, setModels] = useState([
        {
            id: 'gpt-4',
            provider: 'OpenAI',
            displayName: 'GPT-4',
            description: '最强大的GPT-4模型',
            type: 'text',
            contextWindowTokens: 8192,
            maxOutput: 4096,
            pricing: {
                input: 0.03,
                output: 0.06,
                currency: 'USD'
            },
            releasedAt: '2023-03-14',
            abilities: {
                functionCall: true,
                reasoning: true,
                vision: false
            },
            enabled: true
        },
        {
            id: 'gpt-3.5-turbo',
            provider: 'OpenAI',
            displayName: 'GPT-3.5 Turbo',
            description: '最具成本效益的GPT模型',
            type: 'text',
            contextWindowTokens: 4096,
            maxOutput: 2048,
            pricing: {
                input: 0.0015,
                output: 0.002,
                currency: 'USD'
            },
            releasedAt: '2022-11-30',
            abilities: {
                functionCall: true,
                reasoning: true,
                vision: false
            },
            enabled: true
        }
    ]);


    return (
        <Tooltip
            title="选择对话模型"
        >
            <Dropdown
                trigger={['click']}
                menu={{
                    items: models.map(model => ({
                        key: model.id,
                        label: model.displayName,
                        value: model.id,
                        description: model.description,
                        provider: model.provider,
                        pricing: model.pricing,
                        abilities: model.abilities,
                        enabled: model.enabled,
                        icon: getIconByName(model.provider),
                        onClick: () => {
                            console.log('model clicked');
                        }
                    })),
                }}
            >
                <Button
                    type="text"
                    shape="circle"
                    size="large"
                >
                    <BrainCog />
                </Button>
            </Dropdown>
        </Tooltip>
    )
}