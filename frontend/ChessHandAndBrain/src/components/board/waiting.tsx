
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "./websocket";



export default function WaitingRoom(){


    const [username, setUsername] = useState("")
    const navigate = useNavigate()
    const location = useLocation()
    



    useEffect(()=>{
      const message = {status: "FETCH_LOBBY" , userid:location.state.userid}
      socket.send(JSON.stringify(message))
      console.log("Sent Fetch ")

    ,[]})


    socket.addEventListener("message" , (event) => {
      const message = JSON.parse(event.data)
      if(message.hasOwnProperty("gameId")){

        
        navigate("./game", {state: {...location.state,...message}})
      }
    })





  

    




    return(
        <>
        <h2>Please wait while players join </h2>
        </>
    )
}


