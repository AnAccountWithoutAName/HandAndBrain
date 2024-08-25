import { Chessboard } from "react-chessboard";
import "./board.css";
import React, { Component, useEffect, useRef } from "react";
import { Move, Piece, PieceSymbol, Square } from "chess.js";
import { Chess } from "chess.js";
import { useState } from "react";
import socket from "./websocket";
import { useLocation } from "react-router-dom";

export default function Board_multiplayer() {
  const [game, setGame] = useState(new Chess());
  const Player = useRef({ role: "", colour: "", turn: false });
  const [gamestate, setGamestate] = useState<any>({});
  const [movefrom, setMovefrom] = useState(null);
  const [movesqr, setMovesqrs] = useState({});
  const location = useLocation()
  


  useEffect(() => {
    switch (gamestate.roles[gamestate.userid]) {
      case "wb":
        Player.current = { turn: true, role: "Brain", colour: "w" };
        break;
      case "wh":
        Player.current = { turn: false, role: "Hand", colour: "w" };
        break;
      case "bb":
        Player.current = { turn: false, role: "Brain", colour: "b" };
        break;
      case "bh":
        Player.current = { turn: false, role: "Hand", colour: "b" };
        break;
    }
    setGamestate(location.state)
  }, []);


  useEffect(()=>{

    socket.addEventListener("message",(event)=>{

      const message = JSON.parse(event.data)
      const gamestateCopy = {...gamestate, validMoves: message.validMoves, highlightSquares: message.highlightSquares,turn: message.turn, piecePositions: message.piecePositions, fen: message.fen}
      setGamestate(gamestateCopy)
      const gameCopy = new Chess(gamestateCopy.fen)
      setGame(gameCopy)

      if(gamestateCopy.turn === gamestateCopy.userid){
        Player.current.turn = true
      }

    })



  },[gamestate,Player.current.turn])



  function generateMoves(square: any) {
    const squaresToHighlight = gamestate.validMoves[square];
    const displaymoves: any = {};
    squaresToHighlight.forEach((sq: any) => {
      sq = sq.replace("#", "");
      sq = sq.replace("+", "");
      sq = sq.slice(-2);

      displaymoves[sq] = {
        background:
          "radial-gradient(circle , rgba(0,0,0,0.1) 30%, transparent 30%)",
        borderRadius: "50%",
      };
    });

    setMovesqrs(displaymoves);
  }

  function UpdatePiecePosition(
    piecePositions: { [piece: string]: Array<Square> },
    piece: string,
    move: any
  ) {
    piecePositions[piece].splice(piecePositions[piece].indexOf(move.from), 1);
    piecePositions[piece].push(move.to);
    return piecePositions;
  }

  function Move(move: any, piece: any) {
    const gameCopy = new Chess(game.fen());
    const valid = gameCopy.move(move);
    if (valid === null) {
      return false;
    }
    setGame(gameCopy);

    const piecePositions = UpdatePiecePosition(
      gamestate.piecePositions,
      piece.toLowerCase(),
      move
    );

    const gamestateCopy = {
      ...gamestate,
      validMoves: {},
      highlightSquares: {},
      piecePositions: piecePositions,
      fen: gameCopy.fen(),
    };

    socket.send(JSON.stringify({ status: "MADE_MOVE", ...gamestateCopy }));

    setGamestate(gamestateCopy);

    return true;
  }

  function onBrainMove(square: any, piece: any) {
    if (piece) {
      if (
        Player.current.colour === piece[0].toLowerCase() &&
        !Object.keys(gamestate.highlightSquares).includes(square)
      ) {
        const squaresToHighlight =
          gamestate.piecePositions[piece.toLowerCase()];
        const styling: any = {};
        squaresToHighlight.forEach((sq: any) => {
          if (game.moves({ square: sq }).length === 0) return;

          styling[sq] = {
            background:
              "radial-gradient(circle at center,#4deb38 ,#47ba38 95% , transparent 5%)",
            borderRadius: "0%",
          };
        });
        const gamestateCopy = { ...gamestate, highlightSquares: styling };

        setGamestate(gamestateCopy);
      }

      if (
        Player.current.colour === piece[0].toLowerCase() &&
        Object.keys(gamestate.highlightSquares).includes(square)
      ) {
        const finalSquares = gamestate.piecePositions[piece.toLowerCase()];
        var validmoves: any = {};
        finalSquares.foreach((sq: any) => {
          validmoves[sq] = game.moves({ square: sq });
        });

        const whoseTurn = Object.keys(gamestate.roles).indexOf(gamestate.userid)

        const gamestateCopy = { ...gamestate, validMoves: validmoves, turn: Object.keys(gamestate.roles)[(whoseTurn + 1)%4]};
        setGamestate(gamestateCopy);

        socket.send(JSON.stringify({ status: "MADE_MOVE", ...gamestateCopy }));

        Player.current.turn = false;
      }
    }
  }
  function onHandMove(square: any, piece: any) {
    if (piece) {
      if (Object.keys(gamestate.highlightSquares).includes(square)) {
        generateMoves(square);
        setMovefrom(square);
        return;
      } else if (Object.keys(movesqr).includes(square)) {
        Move({ from: movefrom, to: square }, piece);
        Player.current.turn = false;

      }
    }
  }

  function onClick(square: any, piece: any) {
    if (Player.current.turn === true) {
      if (Player.current.role === "Brain") {
        onBrainMove(square, piece);
      } else {
        onHandMove(square, piece);
      }
    }
  }

  return (
    <div>
      <div className="flex flex-row justify-center my-4 relative w-full ">
        <span className="inline-block justify-center items-center w-auto h-auto relative drop-shadow-2xl">
          <Chessboard
            position={game.fen()}
            onSquareClick={onClick}
            customSquareStyles={{ ...gamestate.highlightSquares, ...movesqr }}
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
