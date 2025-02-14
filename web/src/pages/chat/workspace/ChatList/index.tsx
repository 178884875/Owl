import { useChatStore } from '@/store/chat';
import { Flexbox } from 'react-layout-kit';
import MessageItem from './MessageItem';
import { chatSelectors } from '@/store/chat/selectors';
import { getMessages } from '@/apis/Message';
import { useEffect } from 'react';


export default function ChatList() {
    const [
        messages, 
        setMessages,
        currentSession
    ] =
        useChatStore(state => [chatSelectors.getMessages(state), state.setMessages,state.currentSession]);

    const loadMessages = async () => {
        try {
            if(currentSession.id === -1) return;

            if(!currentSession) return;

            const result = await getMessages(currentSession.id);

            if(result.success){
                setMessages(result.data);
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    useEffect(() => {
        loadMessages();
    }, [currentSession]);

    return <Flexbox style={{
        transition: 'width 0.3s',
        padding: 5,
        marginTop: 10,
        width: 'auto',
        flex: 1,
    }}>
        {
            messages?.map((message: any) => {
                return (<MessageItem id={message} />);
            })
        }
    </Flexbox>
}