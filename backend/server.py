import asyncio
from websockets.server import serve
import websockets
import json



Clients_Queue = []
Clients = {}
Games = []
Game_id_last = 0
Players = {}


class Game():
    def __init__(self, players , gameId, usernames):
        self.fen = "start"
        self.validMoves = {}
        self.highlightSquares = {}
        self.roles = {k:v for k,v in zip(players,['wb','wh','bb','bh'])}
        self.usernames = usernames
        self.gameId = gameId
        self.turn = list(self.roles.keys())[0]
        self.moves = 0
        self.piecePositions = {}
    def setValidMoves(self, validMoves):
        self.validMoves = validMoves
    def sethighlightSquares(self, highlightSquares):
        self.highlightSquares = highlightSquares


def updateGame(game_id,data):
    game = Games[game_id]
    game.validMoves = data['validMoves']
    game.highlightSquares = data['highlightSquares']
    game.turn = data['turn']
    game.piecePositions = data['piecePositions']




async def GameConstructor(websocket):
    global Clients_Queue, Game_id_last, Clients
    async for message in websocket:
        data = json.loads(message)
        print(data)
        if(data['status'] == "NEW_JOIN"):
            Clients_Queue.append(data['userid'])
            Clients.update({data['userid']:(websocket,data['username'])})
            print(f"Client {data['username']} has joined")
            print("Client Queue: ", Clients_Queue)
            if(len(Clients_Queue) >= 4):
                Players = Clients_Queue[:4]
                Clients_Queue = Clients_Queue[4:]
                Games.append(Game(Players,Game_id_last, [Clients[id][1] for id in Players]))
                Game_id_last += 1
            print("Init: ", websocket.id)


        if(data['status'] == "FETCH_LOBBY"):
            if(data['userid'] not in Clients_Queue):
                for sockets in [Clients[ws][0] for ws in Games[-1].roles.keys()]:
                    await sockets.send(json.dumps(Games[-1].__dict__))
            print("Done Sending")
        if(data['status'] == "MADE_MOVE"):
            print("Received Move")
            id = data['gameId']
            updateGame(int(id),data)
            for sockets in [Clients[ws][0] for ws in Games[int(id)].roles.keys()]:
                await sockets.send(json.dumps(Games[id].__dict__))




            

            
            


        




                #do something


            
                


        


async def main():
    async with serve(GameConstructor,"localhost",5000):
        await asyncio.Future()

if __name__ == "__main__":
    try:
        print("running ws server")
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Stopping server")


