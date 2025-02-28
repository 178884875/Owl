import { Button, } from 'antd';
import { Rocket, } from 'lucide-react';
import './styles.css';

export default function ConsoleWelcome() {
    return (
        <div className="welcome-container">
            <div className="welcome-header">
                <Rocket className="welcome-icon" />
                <h1>欢迎来到控制台</h1>
            </div>
            <p>这里是您的控制台，您可以在这里管理所有设置。</p>
            <Button type="primary" className="start-button">
                开始使用
            </Button>
        </div>
    )
}