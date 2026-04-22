import { vi, expect, test, afterEach } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";
import { usePayments } from "./usePayments";
import * as firestore from "firebase/firestore";

vi.mock("firebase/firestore", async () => {
  const actual = await vi.importActual("firebase/firestore");
  return {
    ...actual,
    collection: vi.fn(),
    addDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    onSnapshot: vi.fn(),
    Timestamp: { now: vi.fn() },
    doc: vi.fn(),
    updateDoc: vi.fn(),
  };
});

vi.mock("@ayasemota/firebase", () => ({
  db: {}
}));

afterEach(() => {
  cleanup();
});

test("addPayment throws expected error", async () => {
  const { result } = renderHook(() => usePayments("test@example.com"));
  vi.mocked(firestore.addDoc).mockRejectedValueOnce(new Error("Test error"));

  await expect(result.current.addPayment({} as any, "test@example.com")).rejects.toThrow("Test error");
});

test("addPayment throws generic error when non-Error is caught", async () => {
  const { result } = renderHook(() => usePayments("test@example.com"));
  vi.mocked(firestore.addDoc).mockRejectedValueOnce("String error");

  await expect(result.current.addPayment({} as any, "test@example.com")).rejects.toThrow("Failed to add payment");
});
