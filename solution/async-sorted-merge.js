"use strict";

const { default: Semaphore } = require("semaphore-async-await");
const MinHeap = require("heap");

// Configure the maximum number of concurrent operations
const MAX_CONCURRENT = 50;
const semaphore = new Semaphore(MAX_CONCURRENT);

module.exports = async (logSources, printer) => {
  /*
   * Using a min-heap to manage and retrieve the smallest log entry from multiple sources.
   * This ensures that we always process the log entry with the earliest date next,
   * maintaining the correct chronological order.
   */
  const heap = new MinHeap((a, b) => a.logEntry.date - b.logEntry.date);

  // Initializing the heap with the first log entry from each source
  try {
    await Promise.all(
      logSources.map(async (source, index) => {
        await semaphore.acquire();
        try {
          const logEntry = await source.popAsync();
          if (logEntry) {
            heap.push({ logEntry, sourceIndex: index });
          }
        } catch (err) {
          console.error(`Error fetching log entry from source ${index}:`, err);
        } finally {
          semaphore.release();
        }
      })
    );

    // Processing and printing logs in chronological order
    while (!heap.empty()) {
      const { logEntry, sourceIndex } = heap.pop();
      printer.print(logEntry);

      // Fetching the next log entry from the same source
      await semaphore.acquire();
      try {
        const nextLog = await logSources[sourceIndex].popAsync();
        if (nextLog) {
          heap.push({ logEntry: nextLog, sourceIndex });
        }
      } catch (err) {
        console.error(
          `Error fetching next log entry from source ${sourceIndex}:`,
          err
        );
      } finally {
        semaphore.release();
      }
    }

    // Indicating that all logs have been processed
    printer.done();
  } catch (err) {
    console.error("Error processing logs:", err);
    printer.done(); // Ensuring `done` is called even if an error occurs
  }
};
