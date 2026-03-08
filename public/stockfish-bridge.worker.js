// Web Worker bridge for Stockfish WASM (lite-single build)
// The single-threaded Stockfish build uses listener/processCommand API.
// We need to: 1) create the engine with a listener callback
// 2) queue commands until processCommand is available
// 3) forward commands via processCommand

self.importScripts('/stockfish.js')

var queue = []

// Stockfish is a double-factory: Stockfish() returns a factory,
// factory(config) returns the engine module
var factory = Stockfish()
var engine = factory({
  locateFile: function (file) {
    return '/' + file
  },
  listener: function (line) {
    // Forward engine output to main thread
    self.postMessage(line)
  }
})

// Receive commands from main thread
self.onmessage = function (event) {
  var cmd = event.data
  if (engine && engine.processCommand) {
    engine.processCommand(cmd)
  } else {
    queue.push(cmd)
  }
}

// Poll until processCommand is available, then flush queued commands
var readyInterval = setInterval(function () {
  if (engine && engine.processCommand) {
    clearInterval(readyInterval)
    for (var i = 0; i < queue.length; i++) {
      engine.processCommand(queue[i])
    }
    queue = []
  }
}, 20)
