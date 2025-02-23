import { useState, useEffect } from 'react';
import { Typography } from 'antd';
import styled from 'styled-components';

const { Text } = Typography;

interface TypewriterEffectProps {
    text: React.ReactNode | string;
    speed?: number;
    style?: React.CSSProperties;
}

const CursorSpan = styled.span`
    display: inline-block;
    width: 2px;
    height: 1.2em;
    background-color: currentColor;
    margin-left: 2px;
    animation: blink 0.7s infinite;
    box-shadow: none;
    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }
`;

const TypewriterEffect = ({ text, speed = 200, style }: TypewriterEffectProps) => {
    const [displayText, setDisplayText] = useState<React.ReactNode | string>('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        if (typeof text === 'string') {
            if (currentIndex < text.length) {
                const timer = setTimeout(() => {
                    setDisplayText(prev => prev + text[currentIndex]);
                    setCurrentIndex(currentIndex + 1);
                }, speed);

                return () => clearTimeout(timer);
            } else {
                const hideTimer = setTimeout(() => {
                    setShowCursor(false);
                }, 1000);

                return () => clearTimeout(hideTimer);
            }
        } else {
            setDisplayText(text);
        }
    }, [currentIndex, text, speed]);

    return (
        <Text style={{
            fontSize: 24,
            fontWeight: 600,
            textAlign: 'center',
            marginBottom: 24,
            textShadow: 'none',
            ...style
        }}>
            {displayText}
            {showCursor && <CursorSpan>|</CursorSpan>}
        </Text>
    );
};

export default TypewriterEffect;
