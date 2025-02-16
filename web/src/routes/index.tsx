import Chat from "@/pages/main/chat";
import GlobalLayout from "../layouts/GlobalLayout";
import Login from "../pages/auth/login";
import MainLayout from "../pages/main";
import Welcome from "@/pages/main/welcome";


const routes = [
    {
        element: <GlobalLayout />,
        children: [
            {
                path: '/auth/login',
                element: <Login />
            },
            {
                element: <MainLayout />,
                children: [
                    {
                        path: '/',
                        element: <Welcome />
                    },
                    {
                        path: '/chat',
                        element: <Chat />
                    }
                ]
            }
        ]
    }
] as any[];


export default routes;