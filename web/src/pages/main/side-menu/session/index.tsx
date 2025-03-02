import { Flexbox } from 'react-layout-kit';
import { useChatStore } from '../../../../store/chat';
import SessionItem from './sessiont-item';
import { chatSelectors } from '../../../../store/chat/selectors';
import DefaultSession from './default';

export default function Session() {
    const [sessionIds] = useChatStore(state => [chatSelectors.getSessions(state)]);

    return (
        <Flexbox style={{
            transition: 'width 0.3s',
            padding: 5,
            marginTop: 10,
            width: 'auto',
            overflow: 'hidden',
            gap: 5,
            flex: 1,
        }}>
            {sessionIds?.length === 0 && <DefaultSession />}
            {
                sessionIds?.map((session: any) => {
                    return (<SessionItem
                        key={session}
                        id={session} />);
                })
            }
        </Flexbox>
    );
}