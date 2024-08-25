

import Game from './components/board/Board_multiplayer';
import Login from './components/board/login';
import {
  Routes, Route
} from "react-router-dom";

import WaitingRoom from './components/board/waiting';





export default function App(){

  return (
    <Routes>
      <Route path = '/' element = {<Login  />}></Route>
      <Route path = 'waiting' element = {<WaitingRoom />} />
      <Route path = 'game' element = {<Game />} />
    </Routes>


    
  );

}

