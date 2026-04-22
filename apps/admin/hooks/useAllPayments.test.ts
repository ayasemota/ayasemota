import { renderHook, act, waitFor } from "@testing-library/react";
import { useAllPayments } from "./useAllPayments";
import { doc, deleteDoc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from "@ayasemota/firebase";

jest.mock("firebase/firestore", () => {
  const original = jest.requireActual("firebase/firestore");
  return {
    ...original,
    collection: jest.fn(),
    doc: jest.fn(),
    deleteDoc: jest.fn().mockResolvedValue(undefined),
    onSnapshot: jest.fn().mockImplementation((q, callback) => {
      // Simulate an initial snapshot with empty payments to quickly resolve loading
      setTimeout(() => {
        callback({ docs: [] });
      }, 0);
      return jest.fn(); // Unsubscribe function
    }),
    query: jest.fn(),
    orderBy: jest.fn(),
  };
});

jest.mock("@ayasemota/firebase", () => ({
  db: {},
}));

describe("useAllPayments deletePayment", () => {
  let originalNavigatorOnline: boolean;

  beforeEach(() => {
    jest.clearAllMocks();
    originalNavigatorOnline = navigator.onLine;

    // Setup localStorage mock
    const store: Record<string, string> = {};
    const mockLocalStorage = {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        for (const key in store) delete store[key];
      })
    };
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "onLine", {
      value: originalNavigatorOnline,
      configurable: true,
    });
    localStorage.clear();
  });

  const setOnlineStatus = (status: boolean) => {
    Object.defineProperty(navigator, "onLine", {
      value: status,
      configurable: true,
    });
  };

  it("should delete payment online by calling deleteDoc", async () => {
    setOnlineStatus(true);

    const mockDocRef = { id: "payment_123" };
    (doc as jest.Mock).mockReturnValue(mockDocRef);

    const { result } = renderHook(() => useAllPayments());

    // Wait for the initial loading to finish
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deletePayment("payment_123");
    });

    expect(doc).toHaveBeenCalledWith(db, "payments", "payment_123");
    expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
  });

  it("should handle offline delete by storing in localStorage and updating local state", async () => {
    setOnlineStatus(false);

    // We want to simulate the hook having an initial state.
    // Instead of mocking the hook state directly, we provide a snapshot with a document.
    (onSnapshot as jest.Mock).mockImplementationOnce((q, callback) => {
      setTimeout(() => {
        callback({
          docs: [
            { id: "payment_123", data: () => ({ amount: 100 }) },
            { id: "payment_456", data: () => ({ amount: 200 }) }
          ]
        });
      }, 0);
      return jest.fn();
    });

    const { result } = renderHook(() => useAllPayments());

    // Wait for initial data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.payments).toHaveLength(2);
    });

    // Mock Date.now so the temp id is predictable
    const realDateNow = Date.now.bind(global.Date);
    global.Date.now = jest.fn(() => 1234567890);

    await act(async () => {
      await result.current.deletePayment("payment_123");
    });

    // Restore Date.now
    global.Date.now = realDateNow;

    // Verify it updated local storage
    expect(localStorage.getItem).toHaveBeenCalledWith("pending_payments");
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "pending_payments",
      JSON.stringify([{
        id: "temp_1234567890",
        payment: {},
        type: "delete",
        paymentId: "payment_123"
      }])
    );

    // Verify it updated local state
    expect(result.current.payments).toHaveLength(1);
    expect(result.current.payments[0].id).toBe("payment_456");

    // Verify it updated cached_payments in local storage
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "cached_payments",
      JSON.stringify([{ id: "payment_456", amount: 200 }])
    );

    // Verify deleteDoc was not called
    expect(deleteDoc).not.toHaveBeenCalled();
  });
});
