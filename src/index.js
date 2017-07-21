import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const sp = ' ';

function Square(props) {
  let classnames = 'square' + sp + (props.xMove ? 'cursor-x' : 'cursor-o') + sp + (props.winningLine.filter((v) => v === props.index).length > 0 ? 'winner' : '');
  return (
    <button className={classnames} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {

  renderSquare(i) {
    return (
      <Square
        key={i}
        index={i}
        xMove={this.props.xMove}
        winningLine={this.props.winningLine}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    let r = 0, boardrows = [];
    for (let i=0; i<3; i++) {
      let squares = [];
      for (let j=0; j<3; j++) {
        squares.push(
            this.renderSquare(r)
        );
        r++;
      }
      boardrows.push(
        <div key={i} className="board-row">
          {squares}
        </div>
      );
    }
    return (
      <div>
        {boardrows}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        winningLine: Array(3).fill(null),
      }],
      marks: 0,
      xIsNext: true,
      stepNumber: 0,
      sortAscending: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        winningLine: calculateWinner(squares).winningLine,
      }]),
      marks: this.state.marks + 1,
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  handleRestartClick(e) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    this.setState({
      history: history.concat([{
        squares: Array(9).fill(null),
        winningLine: Array(3).fill(null),
      }]),
      marks: 0,
      stepNumber: history.length,
      xIsNext: true,
    });
    e.target.display = 'none';
  }

  handleSortClick(x) {
    if (x > 1) {
      this.setState({
        sortAscending: !this.state.sortAscending,
      });
    }
  }

  jumpTo(step) {
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0,
      });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares).winner;
    const gameIsOver = winner || checkTie(this.state.marks, current.squares);

    const moves = history.map((step, move) => {
        const win = calculateWinner(step.squares).winner;
        const marks = step.squares.filter(Boolean).length;
        const over = win || checkTie(marks, step.squares);

        const diffObj = diff(step.squares, history[move - 1] ? history[move - 1].squares : step.squares);
        const stepMove = diffObj.value + ' moved to ' + coord(diffObj.index);

        const gameEnding = (win !== null) ? (win + ' wins') : ((over !== false) ? 'Tie game' : 'New game');
        const gameInProgress = (move > 0 && marks === 0) ? 'New game' : (move ? stepMove : 'Game start');
        const desc = (win !== null || over !== false) ? gameEnding : gameInProgress;

        return (
          <li key={move} className={move === this.state.stepNumber ? 'bold' : ''}>
            <a href="#" onClick={() => this.jumpTo(move)}>{desc}</a>
          </li>
        );
    });

    if (moves.length > 1) {
      if (this.state.sortAscending) {
        moves.sort(function(a,b){ return parseInt(a.key)  - parseInt(b.key);});
      } else {
        moves.reverse();
      }
    }

    let status, restart = 'Restart Game', sort = this.state.sortAscending ? 'Ascend' : 'Descend';
    let restartButtonStyle = 'lightblue cursor-hand' + sp + (!gameIsOver ? 'hidden' : 'visible inherit');
    let toggleButtonStyle = (this.state.sortAscending ? 'lightgreen' : 'lightred') + sp + 'cursor-hand sort-order';
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (gameIsOver && this.state.marks > 1) {
      status = 'Game Over - Tie';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    return (
      <div className="game">
        <div className="game-status">
          <div>{status}</div>
        </div>
        <div className="game-option-restart">
          <button className={restartButtonStyle} onClick={(e) => this.handleRestartClick(e)}>
            {restart}
          </button>
        </div>
        <div className="game-board">
          <Board
            squares={current.squares}
            winningLine={current.winningLine}
            xMove={this.state.xIsNext}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-option-toggle">
          <button className={toggleButtonStyle} onClick={(e) => this.handleSortClick(moves.length)}>
            {sort}
          </button>
        </div>
        <div className="game-info">
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function checkTie(marks, squares) {
    return marks === squares.length;
}

function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return {'winner': squares[a], 'winningLine': [a, b, c]};
      }
    }
    return {'winner': null, 'winningLine': [null, null, null]};
}

function coord(x) {
  if (x !== null) {
    let i = (x === 0 ? 0 : (x % 3)) + 1;
    let j = (Number.parseInt(x / 3, 10)) + 1;
    return '(' + i + ', ' + j +  ')';
  }
  return null;
}

function diff(a, b) {
  if (a.length === b.length) {
    for (let x = 0; x < a.length; x++) {
      if (a[x] !== b[x]) {
        return {'index': x, 'value': a[x]};
      }
    }
  }
  return {'index': -1, 'value': null};
}

// Polyfill - [ParseInt Compatibility] - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/parseInt
if (!Number.parseInt) {
  Number.parseInt = parseInt;
}

// Polyfill - [Fill Compatibility] - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill#Polyfill
if (!Array.prototype.fill) {
  Object.defineProperty(Array.prototype, 'fill', {
    value: function(value) {

      // Steps 1-2.
      if (this == null) {
        throw new TypeError('this is null or not defined');
      }

      var O = Object(this);

      // Steps 3-5.
      var len = O.length >>> 0;

      // Steps 6-7.
      var start = arguments[1];
      var relativeStart = start >> 0;

      // Step 8.
      var k = relativeStart < 0 ?
        Math.max(len + relativeStart, 0) :
        Math.min(relativeStart, len);

      // Steps 9-10.
      var end = arguments[2];
      var relativeEnd = end === undefined ?
        len : end >> 0;

      // Step 11.
      var final = relativeEnd < 0 ?
        Math.max(len + relativeEnd, 0) :
        Math.min(relativeEnd, len);

      // Step 12.
      while (k < final) {
        O[k] = value;
        k++;
      }

      // Step 13.
      return O;
    }
  });
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
