// Web Worker for Stockfish WASM
// This script runs inside a Web Worker context.
// It imports the stockfish engine and forwards messages.

self.importScripts('/stockfish.js')

// stockfish.js creates a global `Stockfish` factory function
const engine = Stockfish()

engine.onmessage = function (event) {
  // Forward engine output to the main thread
  const line = typeof event === 'string' ? event : event.data
  self.postMessage(line)
}

self.onmessage = function (event) {
  // Forward main thread commands to the engine
  engine.postMessage(event.data)
}
