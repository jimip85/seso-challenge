"use strict";

const { default: Semaphore } = require("semaphore-async-await");
const MinHeap = require("heap");

const MAX_CONCURRENT = 50; // Limit for concurrent asynchronous operations
const semaphore = new Semaphore(MAX_CONCURRENT);

// Limit of 2 logs in memory per source to manage memory usage
const BUFFER_LIMIT = 2;

module.exports = async (logSources, printer) => {
  // Create a Min-Heap to sort log entries by date and source index
  const heap = new MinHeap((a, b) => {
    const dateComparison = a.logEntry.date - b.logEntry.date;
    return dateComparison === 0
      ? a.sourceIndex - b.sourceIndex // Use source index to resolve date ties
      : dateComparison;
  });

  // Fetch logs from a specific source with controlled concurrency
  const fetchNextLogs = async (sourceIndex) => {
    await semaphore.acquire(); // Allow only up to MAX_CONCURRENT fetches at a time
    try {
      const buffer = [];
      for (let i = 0; i < BUFFER_LIMIT; i++) {
        // Fetch logs from the source
        const logEntry = await logSources[sourceIndex].popAsync();
        if (logEntry) {
          buffer.push(logEntry); // Add the log to the buffer
        } else {
          break; // Exit if no more logs are available
        }
      }

      // Push the buffered logs into the heap
      buffer.forEach((logEntry) => heap.push({ logEntry, sourceIndex }));
    } catch (err) {
      // Log any errors encountered during fetching
      console.error(`Failed to fetch logs from source ${sourceIndex}`, err);
    } finally {
      semaphore.release(); // Release the semaphore to allow other operations
    }
  };

  // Start by fetching initial logs from all sources
  try {
    await Promise.all(logSources.map((_, index) => fetchNextLogs(index)));

    // Continue processing logs as long as there are entries in the heap
    while (!heap.empty()) {
      // Get the earliest log entry
      const { logEntry, sourceIndex } = heap.pop();
      await printer.print(logEntry); // Print the log entry

      // Fetch more logs from the same source
      fetchNextLogs(sourceIndex); // Fetch logs to refill the heap (non-blocking)
    }

    // Signal that processing is complete
    printer.done();
  } catch (err) {
    // Handle any critical errors during the process
    console.error("Critical error processing logs:", err);
    printer.done(); // Ensure we signal completion even if an error occurs
  }
};
