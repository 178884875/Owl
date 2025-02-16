import { ArrowBigUpDash, Coffee } from "lucide-react";
import { Flexbox } from "react-layout-kit";
import { useChatStore } from "../../../../store/chat";
import { Avatar, Button} from "antd";
import { useStyles } from "./styles";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { UserMenu } from "./user-menu";

export default function UserInfo() {
    const [expanded] =
        useChatStore(state => [state.sideBarExpanded]);

    const navigate = useNavigate()

    const { styles, cx } = useStyles();

    const user = useUser()

    if (!expanded) {
        return <Flexbox
            style={{
                width: '100%',
                backgroundColor: 'white',
                borderRadius: 8,
                cursor: 'pointer',
                padding: 10,
            }}
        >
            <UserMenu>
                <Avatar
                    size={32}
                    src={user?.avatar}
                />
            </UserMenu>
        </Flexbox>;
    }


    return (<Flexbox
        style={{
            width: '100%',
            backgroundColor: 'white',
            borderRadius: 8,
            cursor: 'pointer',
        }}
    >
        {user && (
            <UserMenu>
                <Flexbox
                    horizontal
                    className={cx(styles.container)}
                >
                    <Avatar
                        size={32}
                        src={user.avatar}
                    />
                    <span
                        className={cx(styles.title)}
                    >
                        {user?.userName}
                    </span>
                    <Button
                        type="text"
                        size="small"
                        className={cx(styles.top)}
                    >
                        <ArrowBigUpDash />
                    </Button>
                </Flexbox>
            </UserMenu>
        )}
        <Flexbox
            horizontal
            style={{
                padding: 10,
                width: 'auto',
                justifyContent: 'space-between',
            }}
        >
            <Coffee
                size={20}
            />
            <span 
                onClick={()=>{
                    navigate('/help')
                }}
                style={{
                fontSize: 14,
                textDecoration: 'underline',
                color: 'gray',
            }}>
                帮助和反馈
            </span>
        </Flexbox>
    </Flexbox>)
}