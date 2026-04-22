import { renderHook, act } from "@testing-library/react";
import { useUsers } from "../useUsers";
import { updateDoc, doc } from "firebase/firestore";

// Mock Firebase
vi.mock("firebase/firestore", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    collection: vi.fn(),
    onSnapshot: vi.fn((ref, callback) => {
      // Return a dummy unsubscribe function
      return vi.fn();
    }),
    doc: vi.fn(() => ({ id: "mockDocRef" })),
    updateDoc: vi.fn(),
    setDoc: vi.fn(),
    deleteDoc: vi.fn(),
    Timestamp: { now: vi.fn(() => ({ toDate: () => new Date() })) },
  };
});

// Mock @ayasemota/firebase
vi.mock("@ayasemota/firebase", () => ({
  db: {},
}));

describe("useUsers offline fallback", () => {
  const originalOnLine = navigator.onLine;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Default to online
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: originalOnLine,
    });
  });

  it("should perform online update correctly", async () => {
    const { result } = renderHook(() => useUsers());

    await act(async () => {
      await result.current.updateUser("user1", { firstName: "Test" });
    });

    expect(updateDoc).toHaveBeenCalledTimes(1);
    expect(doc).toHaveBeenCalledWith({}, "users", "user1");
    expect(localStorage.getItem("pending_user_updates")).toBeNull();
  });

  it("should add to pending_user_updates in localStorage when offline", async () => {
    // Mock navigator.onLine = false
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    });

    const { result } = renderHook(() => useUsers());

    // Initially, localstorage is empty
    expect(localStorage.getItem("pending_user_updates")).toBeNull();

    await act(async () => {
      await result.current.updateUser("user2", { firstName: "Offline Update" });
    });

    // Should not call updateDoc
    expect(updateDoc).not.toHaveBeenCalled();

    // Should add to localStorage
    const pendingData = localStorage.getItem("pending_user_updates");
    expect(pendingData).not.toBeNull();

    const pendingArray = JSON.parse(pendingData!);
    expect(Array.isArray(pendingArray)).toBe(true);
    expect(pendingArray).toHaveLength(1);
    expect(pendingArray[0]).toMatchObject({
      userId: "user2",
      updates: { firstName: "Offline Update" }
    });
    expect(pendingArray[0].id).toMatch(/^temp_\d+/);
  });

  it("should handle error during updateDoc as offline fallback", async () => {
    // Even if online is true, if updateDoc throws, it falls back to pending updates

    // Setup updateDoc to throw
    (updateDoc as any).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useUsers());

    // Initially, localstorage is empty
    expect(localStorage.getItem("pending_user_updates")).toBeNull();

    // The function throws the error but adds to pending_user_updates before that
    await act(async () => {
      try {
        await result.current.updateUser("user3", { lastName: "Error Update" });
      } catch (e) {
        // Expected to throw
      }
    });

    expect(updateDoc).toHaveBeenCalledTimes(1);

    // Should add to localStorage
    const pendingData = localStorage.getItem("pending_user_updates");
    expect(pendingData).not.toBeNull();

    const pendingArray = JSON.parse(pendingData!);
    expect(Array.isArray(pendingArray)).toBe(true);
    expect(pendingArray).toHaveLength(1);
    expect(pendingArray[0]).toMatchObject({
      userId: "user3",
      updates: { lastName: "Error Update" }
    });
  });
});
