import { Welcome } from '@ant-design/x';
import { Flexbox } from 'react-layout-kit';
import Title from '../chat/features/Title';

export default function WelcomePage() {
    return (
        <Flexbox style={{
            flex: 1,
            height: '100%',
        }}>
            <Title />
            <Flexbox style={{
                height: '100vh',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 20,
                margin: 20,
                width: '100%'
            }}>
                <Welcome
                    icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
                    title="欢迎使用 Thor Chat"
                    description="Thor Chat是一款基于AI的智能聊天机器人，旨在为用户提供更加智能化的聊天体验。"
                />
            </Flexbox>
        </Flexbox>)
}