import {Flexbox} from 'react-layout-kit';
import { useChatStore } from '../../../../store/chat';

export default function Session(){
    const [sessions,currentSession] = useChatStore(state => [state.sessions,state.currentSession]);
    return (
        <Flexbox style={{
            transition: 'width 0.3s',
            padding: 5,
            marginTop: 10,
        }}>
            {
                sessions?.map((session:any) => {
                    return (
                        <Flexbox
                            key={session.id}
                            style={{
                                padding: 5,
                                cursor: 'pointer',
                                backgroundColor: currentSession?.id === session.id ? '#f0f0f0' : 'transparent',
                            }}
                        >
                            {session.name}
                        </Flexbox>
                    );
                })
            }
        </Flexbox>
    );
}