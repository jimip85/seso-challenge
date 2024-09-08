"use strict";

const syncSortedMerge = require("../solution/sync-sorted-merge");

describe("syncSortedMerge", () => {
  let mockPrinter;
  let mockLogSources;

  beforeEach(() => {
    mockPrinter = {
      print: jest.fn(),
      done: jest.fn(),
    };
  });

  test("should handle empty log sources", () => {
    const emptyLogSources = [];
    syncSortedMerge(emptyLogSources, mockPrinter);
    expect(mockPrinter.done).toHaveBeenCalled();
  });

  test("should process a single log source correctly", () => {
    const logEntry = { date: 1, message: "Single log entry" };
    mockLogSources = [
      {
        pop: jest.fn().mockReturnValueOnce(logEntry).mockReturnValueOnce(null),
      },
    ];

    syncSortedMerge(mockLogSources, mockPrinter);
    expect(mockPrinter.print).toHaveBeenCalledWith(logEntry);
    expect(mockPrinter.done).toHaveBeenCalled();
  });

  test("should process multiple log sources with varying sizes", () => {
    const logEntries1 = [
      { date: 1, message: "Log 1" },
      { date: 3, message: "Log 3" },
    ];
    const logEntries2 = [{ date: 2, message: "Log 2" }];

    mockLogSources = [
      {
        pop: jest
          .fn()
          .mockReturnValueOnce(logEntries1[0])
          .mockReturnValueOnce(logEntries1[1])
          .mockReturnValueOnce(null),
      },
      {
        pop: jest
          .fn()
          .mockReturnValueOnce(logEntries2[0])
          .mockReturnValueOnce(null),
      },
    ];

    syncSortedMerge(mockLogSources, mockPrinter);
    expect(mockPrinter.print).toHaveBeenCalledWith(logEntries1[0]);
    expect(mockPrinter.print).toHaveBeenCalledWith(logEntries2[0]);
    expect(mockPrinter.print).toHaveBeenCalledWith(logEntries1[1]);
    expect(mockPrinter.done).toHaveBeenCalled();
  });

  test("should handle sources that return empty logs", () => {
    mockLogSources = [
      { pop: jest.fn().mockReturnValueOnce(null) },
      { pop: jest.fn().mockReturnValueOnce(null) },
    ];

    syncSortedMerge(mockLogSources, mockPrinter);
    expect(mockPrinter.done).toHaveBeenCalled();
  });

  test("should handle sources with mixed logs and nulls", () => {
    const logEntries1 = [{ date: 1, message: "Log 1" }];
    const logEntries2 = [
      { date: 2, message: "Log 2" },
      { date: 3, message: "Log 3" },
    ];

    mockLogSources = [
      {
        pop: jest
          .fn()
          .mockReturnValueOnce(logEntries1[0])
          .mockReturnValueOnce(null),
      },
      {
        pop: jest
          .fn()
          .mockReturnValueOnce(logEntries2[0])
          .mockReturnValueOnce(logEntries2[1])
          .mockReturnValueOnce(null),
      },
    ];

    syncSortedMerge(mockLogSources, mockPrinter);
    expect(mockPrinter.print).toHaveBeenCalledWith(logEntries1[0]);
    expect(mockPrinter.print).toHaveBeenCalledWith(logEntries2[0]);
    expect(mockPrinter.print).toHaveBeenCalledWith(logEntries2[1]);
    expect(mockPrinter.done).toHaveBeenCalled();
  });

  test("should perform well with a large number of sources", () => {
    const numSources = 1000;
    mockLogSources = Array.from({ length: numSources }, (_, index) => ({
      pop: jest
        .fn()
        .mockReturnValueOnce({ date: index, message: `Log ${index}` })
        .mockReturnValueOnce(null),
    }));

    syncSortedMerge(mockLogSources, mockPrinter);
    expect(mockPrinter.print).toHaveBeenCalledTimes(numSources);
    expect(mockPrinter.done).toHaveBeenCalled();
  });
});
