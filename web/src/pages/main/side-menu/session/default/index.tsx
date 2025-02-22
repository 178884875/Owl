import { useChatStore } from "@/store/chat";
import { Flexbox } from "react-layout-kit";
import {
    theme
} from "antd";

const {
    useToken
} = theme;

export default function DefaultSession() {
    const { token } = useToken();

    const [
        sideBarExpanded
    ] = useChatStore(state => [state.sideBarExpanded]);

    return (
        <>
            {sideBarExpanded && (<Flexbox
                style={{
                    padding: 5,
                    width: '100%',
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: 16,
                    color: token.colorTextDescription,
                    userSelect: 'none',
                }}
                >
                暂无会话
            </Flexbox>)}
        </>
    )
}