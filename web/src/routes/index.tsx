import GlobalLayout from "../layouts/GlobalLayout";
import Login from "../pages/auth/login";
import Chat from "../pages/chat";


const routes = [
    {
        element: <GlobalLayout />,
        children: [
            {
                path: '/auth/login',
                element: <Login />
            },
            {
                path: '/',
                element: <Chat/>
            }
        ]
    }
] as any[];


export default routes;