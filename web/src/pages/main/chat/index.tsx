import { Flexbox } from "react-layout-kit";
import Title from "./features/Title";
import Workspace from "./workspace";
import { useChatStore } from "@/store/chat";
import { useEffect } from "react";
import CodeRendering from "@/components/CodeRendering";

export default function Chat() {
    // 解析路由参数
    const [sessions, selectSession] = useChatStore(state => [state.sessions, state.selectSession]);
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const sessionId = parseInt(query.get('sessionId') || '');
        if (sessionId && sessions) {
            selectSession(sessionId)
        }
    }, [sessions]);

    return (
        <Flexbox style={{
            flex: 1,
            height: '100%',
        }}>
            <Title />
            <Workspace />
            <CodeRendering />
        </Flexbox>
    )
}