# Log Merging Challenge

This repository contains solutions for a log merging challenge, which involves combining log entries from multiple sources in chronological order. The challenge has both synchronous and asynchronous versions, and each solution aims to efficiently merge and print log entries while handling potential errors.

## Decision-Making and Design Choices

### Synchronous Solution

In the synchronous version, the goal is to merge logs from multiple sources and print them in chronological order. Here's why a min-heap was chosen:

- **Min-Heap for Efficiency**: A min-heap is an efficient data structure for managing a dynamically sorted list of elements. By using a min-heap, we can always access and remove the smallest (earliest) log entry efficiently. This ensures that we process logs in the correct chronological order without having to re-sort the entire list repeatedly.

- **Complexity**: The time complexity of inserting an element into a min-heap and extracting the minimum element is O(log n), where n is the number of elements in the heap. This makes the min-heap suitable for scenarios where we need to maintain a sorted order while frequently adding and removing elements.

### Asynchronous Solution

The asynchronous version extends the problem to handle log sources that provide log entries asynchronously. The design choices are as follows:

- **Min-Heap for Asynchronous Handling**: Similar to the synchronous version, a min-heap is used to maintain chronological order of log entries. Asynchronous operations are handled using `async/await`, allowing us to fetch log entries in a non-blocking manner.

- **Error Handling**: Errors during asynchronous log fetching are caught and logged, ensuring that issues with individual log sources do not halt the entire process. The `printer.done()` method is called even in case of errors to ensure that the final processing step is completed.

- **Complexity and Concurrency**: Asynchronous operations are managed using Promises to handle concurrent fetching of log entries. This approach helps to make the most of available resources and improves the overall performance by avoiding blocking operations.

## How to Run

1. Clone the repository:
   ```bash
   git clone <repository>

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