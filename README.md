# Log Merging Challenge

This repository contains solutions for a log merging challenge, which involves combining log entries from multiple sources in chronological order. The challenge includes both synchronous and asynchronous versions, each designed to efficiently merge and print log entries while addressing potential errors.

## Decision-Making and Design Choices

### Synchronous Solution

In the synchronous version, the objective is to merge logs from multiple sources and print them in chronological order. Key design choices include:

- **Min-Heap for Efficiency**: A min-heap is used to efficiently manage the dynamically sorted list of log entries. By leveraging the min-heap, we can always retrieve and remove the earliest log entry, ensuring correct chronological order without frequent re-sorting.

- **Complexity**: Inserting or removing elements from a min-heap takes O(log n), where n is the number of elements in the heap. This ensures efficient management of log entries as they are processed.

### Asynchronous Solution

In the asynchronous solution, the log sources provide entries asynchronously. Key considerations include:

- **Min-Heap for Asynchronous Handling**: As in the synchronous solution, a min-heap is employed to maintain the correct order of log entries. Asynchronous operations are managed using `async/await` to fetch log entries without blocking.

- **Error Handling**: Errors during asynchronous log fetching are handled gracefully by catching and logging errors. Even if one log source fails, the rest of the process continues. The `printer.done()` method is called regardless of errors to ensure final completion of the process.

- **Concurrency**: The asynchronous solution leverages Promises to fetch log entries concurrently, optimizing resource usage and improving overall performance by minimizing blocking operations.

## How to Run

To run the project, follow these steps:

1. Clone the repository:
   ```bash
   git clone <repository-url>

2. Install dependencies:
   ```bash
   npm install

3. Run sync & async solutions:
   ```bash
   npm start

## Testing

To ensure correctness, comprehensive tests are included. They cover various scenarios such as empty sources, single and multiple sources with varying sizes, and performance with a large number of sources.

1. Run Tests:
   ```bash
   npm test

## Conclusion

The chosen approach leverages a min-heap for its efficiency in maintaining sorted order, both in synchronous and asynchronous contexts. This design ensures optimal performance while handling logs from multiple sources effectively.