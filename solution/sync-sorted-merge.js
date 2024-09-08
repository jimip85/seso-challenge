"use strict";

module.exports = (logSources, printer) => {
  const MinHeap = require("heap");

  // Created a min-heap to keep log entries sorted by date
  const heap = new MinHeap((a, b) => a.logEntry.date - b.logEntry.date);

  // Initializing the heap with the first log entry from each source
  logSources.forEach((source, index) => {
    const logEntry = source.pop();
    if (logEntry) {
      heap.push({ logEntry, sourceIndex: index });
    }
  });

  // Processing and printing logs in chronological order
  while (!heap.empty()) {
    const { logEntry, sourceIndex } = heap.pop();
    printer.print(logEntry);

    // Fetching the next log entry from the same source
    const nextLog = logSources[sourceIndex].pop();
    if (nextLog) {
      heap.push({ logEntry: nextLog, sourceIndex });
    }
  }

  printer.done();
};
