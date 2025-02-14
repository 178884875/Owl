import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import routes from './routes'
import '@ant-design/v5-patch-for-react-19';

function App() {
  return (
    <RouterProvider
      router={createBrowserRouter(routes)}
    >
    </RouterProvider>
  )
}

export default App
