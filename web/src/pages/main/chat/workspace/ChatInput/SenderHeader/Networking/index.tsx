import { Flexbox } from "react-layout-kit";
import { Button, theme } from "antd";
import { useChatStore } from "@/store/chat";
import {
    Rss
} from 'lucide-react'

const { useToken } = theme;

export default function Networking() {
    const [
        networking,
        switchNetworking
    ] = useChatStore(state => [state.networking, state.switchNetworking]);

    const { token } = useToken();

    return <Flexbox
        horizontal
        style={{
            marginLeft:5
        }}
    >
        <Button
            size='small'
            style={{
                backgroundColor: networking ? token.colorPrimaryBgHover : 'transparent',
                color: networking ? token.colorPrimary : token.colorTextSecondary
            }}
            icon={<Rss size='14'/>}
            onClick={() => switchNetworking()}
            type="text">
            联网模式
        </Button>
    </Flexbox>;
}
