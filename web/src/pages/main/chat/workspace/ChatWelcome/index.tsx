import styles from './index.module.css';
import { Flexbox } from 'react-layout-kit';
import { PromptsProps, Welcome, Prompts } from '@ant-design/x';
import { CoffeeOutlined, SmileOutlined, FireOutlined } from '@ant-design/icons';
import { useChatStore } from '@/store/chat';
export default function ChatWelcome() {

  const [updateValue]
    = useChatStore(state => [state.updateValue]);

  const items: PromptsProps['items'] = [
    {
      key: '6',
      icon: <CoffeeOutlined style={{ color: '#964B00' }} />,
      description: '如何制作西红柿炒鸡蛋？',
      disabled: false,
    },
    {
      key: '7',
      icon: <SmileOutlined style={{ color: '#FAAD14' }} />,
      description: '请帮我实现一个HTML+CSS+JS的网页，要求如下：1. 页面有一个输入框和按钮，当用户输入文字后，点击按钮，会调用openai的api接口，接口会返回一个图片url，然后页面会显示这个图片，具体的api接口后面再补充',
      disabled: false,
    },
    {
      key: '8',
      icon: <FireOutlined style={{ color: '#FF4D4F' }} />,
      description: 'c# 如何实现一个简单的聊天机器人？',
      disabled: false,
    }
  ];

  return (
    <Flexbox style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div className={styles.welcomeHeader} style={{
        margin: 24,
      }}>
        <Welcome
          style={{
            backgroundImage: 'linear-gradient(97deg, rgba(90,196,255,0.12) 0%, rgba(174,136,255,0.12) 100%)',
            borderStartStartRadius: 4,
          }}
          icon={<img src="/logo.png" alt="Owl Chat Logo" className={styles.logo} />}
          title="欢迎使用 Owl Chat"
          description="您的智能对话助手，随时为您解答问题、提供帮助"
        />
      </div>
      <Flexbox style={{
        margin: 24,
        overflowY: 'auto',
      }}>
        <Prompts style={{
          overflow: 'hidden',
        }} title="你可能还想问:"
          onItemClick={(info) => {
            if (info.data.description) {
              updateValue(info.data.description as string);
            }
          }}
          items={items} vertical />
      </Flexbox>
    </Flexbox>
  );
}
