import { Chessboard } from "react-chessboard";
import "./board.css";
import React, { Component, useEffect, useRef } from "react";
import { Move, Piece, PieceSymbol, Square } from "chess.js";
import { Chess } from "chess.js";
import { useState } from "react";
import socket from "./websocket";
import { useLocation } from "react-router-dom";

var piecePositions: { [piece: string]: Array<Square> } = {
  wp: ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"],
  wr: ["a1", "h1"],
  wn: ["b1", "g1"],
  wb: ["c1", "f1"],
  wq: ["d1"],
  wk: ["e1"],
  bp: ["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"],
  br: ["a8", "h8"],
  bn: ["b8", "g8"],
  bb: ["c8", "f8"],
  bq: ["d8"],
  bk: ["e8"],
};

type PartialMove = {
  from: Square;
  to: Square;
  Promotion?: PieceSymbol;
};

type Player = {
  role: "Hand" | "Brain";
  color: "w"|"b";
};

export default function PlayGame() {
  const [Game, setGame] = useState<Chess>(new Chess());
  const [Player, setPlayer] = useState<Player>({ role: "Brain", color: "w" });
  const [Highlights, setHighlights] = useState({});
  const [ValidMoves, setValidMoves] = useState<any>({});
  const [MoveFrom, setMoveFrom] = useState<Square | null>(null);
  const [MoveTo, setMoveTo] = useState<Square| null>(null);
  const [MoveSquares, setMoveSquares] = useState({})
  const [Flag, setFlag] = useState<boolean>(true);
  const [PieceSel,setPieceSel] = useState<string|null>(null)
  let location = useLocation()
  const [gamestate, setGamestate] = useState(location.state)
  const turn = useRef(gamestate.turn === gamestate.userid)
  const fen = useRef(Game.fen())

  useEffect(()=>{

    switch (gamestate.roles[gamestate.userid]) {
      case "wb":
        setPlayer({ role: "Brain", color: "w" });
        break;
      case "wh":
        setPlayer({ role: "Hand", color: "w" });
        break;
      case "bb":
        setPlayer({ role: "Brain", color: "b" });
        break;
      case "bh":
        setPlayer({ role: "Hand", color: "b" });
        break;
    

    }

  },[])


  function Move(move: PartialMove, piece: string) {
    const GameCopy = new Chess(Game.fen())
    const valid = GameCopy.move(move);
    if (valid === null) {
      return false;
    }
    setGame(GameCopy);

    piecePositions = UpdatePiecePosition(
      piecePositions,
      piece.toLowerCase(),
      move
    );
    console.log(piecePositions);

    return true;
  }

  function UpdatePiecePosition(
    piecePositions: { [piece: string]: Array<Square> },
    piece: string,
    move: PartialMove
  ) {
    piecePositions[piece].splice(piecePositions[piece].indexOf(move.from), 1);
    piecePositions[piece].push(move.to);
    return piecePositions;
  }

  function onDrop(sourceSquare: Square, targetSquare: Square, piece: string) {
    const valid = Move({ from: sourceSquare, to: targetSquare }, piece);
    console.log(valid);
    return valid;
  }

  function onClick(square: Square, piece: string | undefined) {
      
    if(Game.isGameOver()){
      return;
    }

    if(turn){

    if(Player.role === "Brain"){
    if (
      piece !== undefined &&
      Player.color === piece[0] &&
      !Object.keys(Highlights).includes(square) &&
      Flag
    ) {
      console.log(piece)
      var ValidMovesNow: any = {};
      var ValidMovesSquares: any = {};
      piecePositions[piece.toLowerCase()].forEach((Square) => {
        ValidMovesNow[Square] = Game.moves({square: Square})
        if(ValidMovesNow[Square].length === 0){
          return;
        }
        ValidMovesSquares[Square] = { background: "radial-gradient(circle at center,#4deb38 ,#47ba38 95% , transparent 5%)",
          borderRadius:"0%"
         };
      });

      setValidMoves(ValidMovesNow);
      setHighlights({ ...ValidMovesSquares });
      console.log(Highlights);
      return;
    } else if (
      piece !== undefined &&
      Player.color === piece[0] &&
      Object.keys(Highlights).includes(square) &&
      Flag
    ) {
      setFlag(false);
      gamestate.validMoves = ValidMoves
      gamestate.highlightSquares = Highlights
      gamestate.piecePositions = piecePositions
      socket.send({status:"MADE_MOVE", ...gamestate})
      turn.current = false

      return;
    }
  }

  else{
    if(
      Object.keys(Highlights).includes(square) 

    )
    {

      if(piece){
        setPieceSel(piece)
      }

      var MoveSqs:any = {}
    
      ValidMoves[square].forEach((element: any) => {

        element = element.replace("#","")
        element = element.replace("+","")
        element = element.slice(-2)

        MoveSqs[element] = {background: "radial-gradient(circle , rgba(0,0,0,0.1) 30%, transparent 30%)"  ,
        borderRadius: "50%"}}
        

        )

      setMoveFrom(square)
      setMoveSquares(MoveSqs)
      
      }
    if (Object.keys(MoveSquares).includes(square)) {
      setMoveTo(square);
      if (MoveFrom &&  PieceSel) {
        Move({ from: MoveFrom, to: square }, PieceSel);
        setHighlights({})
        setMoveSquares({})
        setMoveFrom(null)
        setMoveTo(null)
        setPieceSel(null)
        setFlag(true)


        return;

      }
    
    }

   }
  }
  else{
    socket.addEventListener("message",(ev) => {
      const message = JSON.parse(ev.data)
      setValidMoves(message.validMoves)
      setHighlights(message.highlightSquares)
      const GameCopy = new Chess(message.fen)
      setGame(GameCopy)
      
    })
  }
 }


  return (
    <div>
      <div className="flex flex-row justify-center my-4 relative w-full ">
        <span className="inline-block justify-center items-center w-auto h-auto relative drop-shadow-2xl">
          <Chessboard
            position={Game.fen()}
            onSquareClick={onClick}
            customSquareStyles={{ ...Highlights, ...MoveSquares }}
            boardWidth={560}
            arePiecesDraggable={false}
            customBoardStyle={{
              borderRadius: "4px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            }}
          />
        </span>
        <p className="text-white">Hi</p>
      </div>
    </div>
  );
}

