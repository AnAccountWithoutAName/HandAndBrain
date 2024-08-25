import { FormEventHandler, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import socket from "./websocket";

export default function Login(props: any) {
  const [username, setUsername] = useState("");
  const userid = useRef(uuid());
  const navigate = useNavigate();

  socket.addEventListener("open", (event) => {
    console.log("Connection is up!");
  });

  function onSubmitHandler(e: any) {
    e.preventDefault();
    const message = {
      status: "NEW_JOIN",
      username: username,
      userid: userid.current,
    };
    socket.send(JSON.stringify(message));
    navigate("./waiting", {
      state: { username: username, userid: userid.current },
    });
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500 to-indigo-800 shadow-md">
      <div className="w-80 h-80 bg-white justify-center relative rounded-md">
        <form onSubmit={onSubmitHandler}>
          <div className="text-center mt-12 mb-12 mx-5">
            <h1 className="text-3xl">Welcome!</h1>
          </div>
          <div className="flex h-full justify-center items-center">
            <input
              type="text"
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              placeholder="Username"
              className="h-10 w-5/6 text-center rounded-md border-2 border-b-slate-800 border-l-slate-200 pl-1 text-lg"
            ></input>
          </div>
          <div className="flex relative bottom-0 w-full justify-center my-4 rounded-sm ">
            <button
              className="border-2 w-5/6 h-10 bg-indigo-800 text-white rounded-md text-lg"
              type="submit"
              disabled={username.length == 0} //&& socket.readyState === socket.OPEN}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
