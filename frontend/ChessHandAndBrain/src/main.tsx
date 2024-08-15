import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from "./App.tsx"
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Login from './components/board/login.tsx';
import PlayGame from './components/board/Board.tsx';
import WaitingRoom from './components/board/waiting.tsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path:"/waiting",
    element:<WaitingRoom/>
  },
  {
    path:"game",
    element: <PlayGame />
  }
]);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router = {router}></RouterProvider>
  </React.StrictMode>,
)
