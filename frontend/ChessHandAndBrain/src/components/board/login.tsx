import { useState } from "react";
 import useWebSocket from "react-use-websocket";
 import { useNavigate } from "react-router-dom";
 

export default function Login(){

     const [username, setUsername] = useState("")
     const socketUrl = "ws://localhost:5000/"
     const { sendJsonMessage } = useWebSocket(socketUrl)
     const navigate = useNavigate()


    function onSubmitHandler(){

        sendJsonMessage({username: username, status:"NEW_JOIN"})
        navigate("/waiting")



        



    }


    return (
      <div className="flex flex-col justify-center items-center h-screen w-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500 to-indigo-800 shadow-md">
        <div className="w-80 h-80 bg-white justify-center relative rounded-md">
          <form onSubmit={onSubmitHandler}>
            <div className = "text-center mt-12 mb-12 mx-5">
            <h1 className="text-3xl">Welcome!</h1>
            </div>
            <div className = "flex h-full justify-center items-center">
            <input type="text" onChange={(e) => {setUsername(e.target.value)}} placeholder="Username" className= "h-10 w-5/6 text-center rounded-md border-2 border-b-slate-800 border-l-slate-200 pl-1 text-lg"></input>
            </div>
            <div className = "flex relative bottom-0 w-full justify-center my-4 rounded-sm ">
            <button className = "border-2 w-5/6 h-10 bg-indigo-800 text-white rounded-md text-lg" type="submit">Submit</button>
            </div>
          </form>
        </div>
      </div>
    );




}