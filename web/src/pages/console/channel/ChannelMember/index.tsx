import { Avatar, Typography } from "antd";
import { ChannelItem } from "../ChannelList";
import { Flexbox } from "react-layout-kit";

interface ChannelMemberProps {
    channel: ChannelItem | null;
}



export default function ChannelMember({ channel }: ChannelMemberProps) {

    return <Flexbox
        style={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
            // 水平居中
            justifyContent: 'center',
            alignItems: 'center',
        }}
        gap={16}
    >
        {
            channel?.shareUsers?.map(({ user }) => (
                <Flexbox
                    horizontal
                    key={user.id}
                    gap={8}
                >
                    <Avatar src={user.avatar} />
                    <Typography.Text>{user.displayName}</Typography.Text>
                </Flexbox>
            ))
        }
        {
            channel?.shareUsers?.length === 0 && (
                <Typography.Text>暂无成员</Typography.Text>
            )
        }
    </Flexbox>
}
