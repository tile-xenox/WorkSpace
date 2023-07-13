import './style.css'
import { Universe, Cell, wasm_memory } from 'wasm-game-of-life';

const CELL_SIZE = 5;
const GRID_COLOR = "#ccc";
const DEAD_COLOR = "#fff";
const ALIVE_COLOR = "#000";

const universe = Universe.new();
const width = universe.width();
const height = universe.height();

const canvas = document.querySelector<HTMLCanvasElement>('#app')!;
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d')!;

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  for (let i = 0; i <= height; i++) {
    ctx.moveTo(0, i * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, i * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
}

const getIndex = (row: number, column: number) => {
  return row * width + column;
};

const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(wasm_memory().buffer, cellsPtr, width * height);

  ctx.beginPath();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = cells[idx] === Cell.Dead
        ? DEAD_COLOR
        : ALIVE_COLOR;

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
};

let previousTimeStamp: DOMHighResTimeStamp = 0;
const renderLoop = (timeStamp: DOMHighResTimeStamp) => {
  const duration = timeStamp - previousTimeStamp;
  if (duration > 200) {
    previousTimeStamp = timeStamp;
    universe.tick();

    drawGrid();
    drawCells();
  }

  requestAnimationFrame(renderLoop);
};

drawGrid();
drawCells();
requestAnimationFrame(renderLoop);

// const pre = document.getElementById("app")!;
// const universe = Universe.new();

// let previousTimeStamp: DOMHighResTimeStamp = 0;
// const renderLoop = (timeStamp: DOMHighResTimeStamp) => {
//   const duration = timeStamp - previousTimeStamp;
//   if (duration > 100) {
//   previousTimeStamp = timeStamp;
//   pre.textContent = universe.render();
//   universe.tick();
//   }
//   requestAnimationFrame(renderLoop);
// };
// requestAnimationFrame(renderLoop);
