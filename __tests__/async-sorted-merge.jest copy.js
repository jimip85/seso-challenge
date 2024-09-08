"use strict";

const asyncSortedMerge = require("../solution/async-sorted-merge");

describe("asyncSortedMerge", () => {
  let mockPrinter;
  let mockLogSources;

  beforeEach(() => {
    mockPrinter = {
      print: jest.fn(),
      done: jest.fn(),
    };

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test("should handle empty log sources", async () => {
    const emptyLogSources = [];
    await asyncSortedMerge(emptyLogSources, mockPrinter);
    expect(mockPrinter.done).toHaveBeenCalled();
  });

  test("should process a single log source correctly", async () => {
    const logEntry = { date: 1, message: "Single log entry" };
    mockLogSources = [
      {
        popAsync: jest
          .fn()
          .mockResolvedValueOnce(logEntry)
          .mockResolvedValueOnce(null),
      },
    ];

    await asyncSortedMerge(mockLogSources, mockPrinter);
    expect(mockPrinter.print).toHaveBeenCalledWith(logEntry);
    expect(mockPrinter.done).toHaveBeenCalled();
  });

  test("should process multiple log sources with varying sizes", async () => {
    const logEntries1 = [
      { date: 1, message: "Log 1" },
      { date: 3, message: "Log 3" },
    ];
    const logEntries2 = [{ date: 2, message: "Log 2" }];

    mockLogSources = [
      {
        popAsync: jest
          .fn()
          .mockResolvedValueOnce(logEntries1[0])
          .mockResolvedValueOnce(logEntries1[1])
          .mockResolvedValueOnce(null),
      },
      {
        popAsync: jest
          .fn()
          .mockResolvedValueOnce(logEntries2[0])
          .mockResolvedValueOnce(null),
      },
    ];

    await asyncSortedMerge(mockLogSources, mockPrinter);
    expect(mockPrinter.print).toHaveBeenCalledWith(logEntries1[0]);
    expect(mockPrinter.print).toHaveBeenCalledWith(logEntries2[0]);
    expect(mockPrinter.print).toHaveBeenCalledWith(logEntries1[1]);
    expect(mockPrinter.done).toHaveBeenCalled();
  });

  test("should handle sources that return empty logs", async () => {
    mockLogSources = [
      { popAsync: jest.fn().mockResolvedValueOnce(null) },
      { popAsync: jest.fn().mockResolvedValueOnce(null) },
    ];

    await asyncSortedMerge(mockLogSources, mockPrinter);
    expect(mockPrinter.done).toHaveBeenCalled();
  });

  test("should handle errors in sources", async () => {
    mockLogSources = [
      { popAsync: jest.fn().mockRejectedValueOnce(new Error("Error")) },
      {
        popAsync: jest
          .fn()
          .mockResolvedValueOnce({ date: 1, message: "Log 1" })
          .mockResolvedValueOnce(null),
      },
    ];

    await asyncSortedMerge(mockLogSources, mockPrinter);
    expect(mockPrinter.print).toHaveBeenCalledWith({
      date: 1,
      message: "Log 1",
    });
    expect(mockPrinter.done).toHaveBeenCalled();
  });

  test("should perform well with a large number of sources", async () => {
    const numSources = 1000;
    mockLogSources = Array.from({ length: numSources }, (_, index) => ({
      popAsync: jest
        .fn()
        .mockResolvedValueOnce({ date: index, message: `Log ${index}` })
        .mockResolvedValueOnce(null),
    }));

    await asyncSortedMerge(mockLogSources, mockPrinter);
    expect(mockPrinter.print).toHaveBeenCalledTimes(numSources);
    expect(mockPrinter.done).toHaveBeenCalled();
  });

  test("should handle errors in fetching logs gracefully", async () => {
    // Mock a log source that throws an error
    const errorLogSource = {
      popAsync: jest.fn().mockRejectedValue(new Error("Simulated error")),
    };

    const logSources = [errorLogSource];
    const printer = { print: jest.fn(), done: jest.fn() };

    await expect(
      asyncSortedMerge(logSources, printer)
    ).resolves.toBeUndefined();

    // Ensure error handling logic is triggered
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Error fetching log entry from source 0:"),
      expect.any(Error)
    );
  });

  test("should handle log entries with the same timestamp", async () => {
    const logEntries = [
      { date: 1, message: "Log 1" },
      { date: 1, message: "Log 2" },
    ];

    mockLogSources = [
      {
        popAsync: jest
          .fn()
          .mockResolvedValueOnce(logEntries[0])
          .mockResolvedValueOnce(null),
      },
      {
        popAsync: jest
          .fn()
          .mockResolvedValueOnce(logEntries[1])
          .mockResolvedValueOnce(null),
      },
    ];

    await asyncSortedMerge(mockLogSources, mockPrinter);
    expect(mockPrinter.print).toHaveBeenCalledWith(logEntries[0]);
    expect(mockPrinter.print).toHaveBeenCalledWith(logEntries[1]);
    expect(mockPrinter.done).toHaveBeenCalled();
  });

  test("should handle delayed responses", async () => {
    const logEntries = [
      { date: 1, message: "Delayed Log 1" },
      { date: 2, message: "Delayed Log 2" },
    ];

    mockLogSources = [
      {
        popAsync: jest
          .fn()
          .mockResolvedValueOnce(
            new Promise((resolve) =>
              setTimeout(() => resolve(logEntries[0]), 100)
            )
          )
          .mockResolvedValueOnce(null),
      },
      {
        popAsync: jest
          .fn()
          .mockResolvedValueOnce(
            new Promise((resolve) =>
              setTimeout(() => resolve(logEntries[1]), 50)
            )
          )
          .mockResolvedValueOnce(null),
      },
    ];

    await asyncSortedMerge(mockLogSources, mockPrinter);
    expect(mockPrinter.print).toHaveBeenCalledWith(logEntries[1]); // Log 2 should come first due to the delay
    expect(mockPrinter.print).toHaveBeenCalledWith(logEntries[0]);
    expect(mockPrinter.done).toHaveBeenCalled();
  });
});
