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
                    title="欢迎使用 AGI 产品"
                    description="AGI 是一个基于 Ant Design 的中后台解决方案，我们希望能够帮助到更多的开发者。"
                />
            </Flexbox>
        </Flexbox>)
}