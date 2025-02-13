import { useEffect } from "react";
import { Flexbox } from "react-layout-kit";
import { useNavigate } from 'react-router-dom'


export default function Chat() {
    const navigate = useNavigate()
    useEffect(() => {
        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/auth/login')
        }

    }, [])

    return (
        <Flexbox style={{
            flex: 1,
        }}>
            Chat
        </Flexbox>
    )
}