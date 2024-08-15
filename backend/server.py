import asyncio
from websockets.server import serve
import json
import uuid

Clients_Queue = []
Clients_Looking_For_Game = 0


async def GameConstructor(websocket):
    async for message in websocket:
        data = json.loads(message)
        print(data)
        if(data['status'] == "NEW_JOIN"):
            Clients_Queue.append({uuid.uuid4(data['username']) : websocket})
            print(f"Client {data['username']} has joined")


async def main():
    async with serve(GameConstructor,"localhost",5000):
        await asyncio.Future()

if __name__ == "__main__":
    try:
        print("running ws server")
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Stopping server")


