import { Flexbox } from "react-layout-kit";
import ChannelList, { ChannelItem } from "./ChannelList";
import { useEffect, useState } from "react";
import { getChannelDetail, getChannelList } from "@/apis/ModelaChannel";
import { Tabs, message } from "antd";
import ChannelMember from "./ChannelMember";
import ChannelModel from "./ChannelModel";
import ChannelConfig from "./ChannelConfig";
import ChannelInviteCode from "./ChannelInviteCode";


export default function ConsoleChannel() {
    const [channel, setChannel] = useState<ChannelItem | null>(null);

    const [loading, setLoading] = useState(true);
    const [channelList, setChannelList] = useState<ChannelItem[]>([]);

    const items = [
        {
            key: 'channelMember',
            label: '渠道成员',
            children: <ChannelMember channel={channel} />
        },
        {
            key: 'channelModel',
            label: '渠道模型',
            children: <ChannelModel />
        },
        {
            key: 'channelConfig',
            label: '渠道配置',
            children: <ChannelConfig />
        },
        {
            label: "渠道邀请码",
            key: "channelInviteCode",
            children: <ChannelInviteCode />
        }
    ]

    useEffect(() => {
        fetchChannelList();
    }, []);

    const onChannelChange = async (id: number) => {
        try {
            const response = await getChannelDetail(id);
            setChannel(response.data);
        } catch (error) {
            console.error("获取渠道详情失败:", error);
            message.error("获取渠道详情失败");
        }
    }

    const fetchChannelList = async () => {
        try {
            setLoading(true);
            const response = await getChannelList();
            setChannelList(response.data);
            if (response.data.length > 0) {
                onChannelChange(response.data[0].id);
            }
        } catch (error) {
            console.error("获取渠道列表失败:", error);
        } finally {
            setLoading(false);
        }
    };

    const onChange = (key: string) => {
        console.log(key);
    }


    return (
        <Flexbox style={{
            width: '100%',
            height: '100%',
            overflow: 'auto'
        }} horizontal gap={16}>
            <ChannelList
                channelList={channelList}
                loading={loading}
                channel={channel}
                onChannelChange={onChannelChange}
                onChannelListChange={setChannelList}
                onChannelCreateSuccess={fetchChannelList}
            />
            <Tabs
                style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                }}
                defaultActiveKey="channelMember" items={items} onChange={onChange} />
        </Flexbox>
    )
}