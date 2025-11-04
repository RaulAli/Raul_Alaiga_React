import { useState } from 'react';

function Square({ value, onSquareClick }) {
    return (
        <button className="square" onClick={onSquareClick}>
            {value}
        </button>
    );
}

function Board({ xIsNext, squares, onPlay }) {
    function handleClick(i) {
        const nextSquares = squares.slice();

        if (calculateWinner(nextSquares)) {
            return;
        }

        const columna = i % 8;
        let jugada = false;

        for (let row = 7; row >= 0; row--) {
            const index = row * 8 + columna;
            if (!nextSquares[index]) {
                nextSquares[index] = xIsNext ? 'X' : 'O';
                jugada = true;
                break;
            }
        }

        if (jugada) {
            onPlay(nextSquares);
        }
    }

    const winner = calculateWinner(squares);
    let status;
    if (winner) {
        status = 'Ganador: ' + winner;
    } else {
        status = 'Siguiente jugador: ' + (xIsNext ? 'X' : 'O');
    }

    return (
        <>
            <div className="status">{status}</div>

            {[0, 1, 2, 3, 4, 5, 6, 7].map(row => (
                <div className="board-row" key={row}>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map(columna => {
                        const i = row * 8 + columna;
                        return (
                            <Square
                                key={i}
                                value={squares[i]}
                                onSquareClick={() => handleClick(i)}
                            />
                        );
                    })}
                </div>
            ))}
        </>

    );
}

export default function Game() {
    const [history, setHistory] = useState([Array(64).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];

    function handlePlay(nextSquares) {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }

    function jumpTo(nextMove) {
        setCurrentMove(nextMove);
    }

    const moves = history.map((squares, move) => {
        let description;
        if (move > 0) {
            description = 'Ir al movimiento #' + move;
        } else {
            description = 'Ir al inicio del juego';
        }
        return (
            <li key={move}>
                <button onClick={() => jumpTo(move)}>{description}</button>
            </li>
        );
    });

    return (
        <div className="game">
            <div className="game-board">
                <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
            </div>
            <div className="game-info">
                <ol>{moves}</ol>
            </div>
        </div>
    );
}

function calculateWinner(squares) {
    const size = 8;
    const cuatro = 4;

    function getCell(linea, columna) {
        if (linea < 0 || columna < 0 || linea >= size || columna >= size) return null;
        return squares[linea * size + columna];
    }

    for (let linea = 0; linea < size; linea++) {
        for (let columna = 0; columna < size; columna++) {
            const jugador = getCell(linea, columna);
            if (!jugador) continue;

            const directions = [
                [0, 1],
                [1, 0],
                [1, 1],
                [1, -1],
            ];

            for (const [difFila, difColumna] of directions) {
                let cantidad = 1;
                for (let k = 1; k < cuatro; k++) {
                    if (getCell(linea + difFila * k, columna + difColumna * k) === jugador) {
                        cantidad++;
                    } else {
                        break;
                    }
                }

                if (cantidad === cuatro) {
                    return jugador;
                }
            }
        }
    }

    return null;
}