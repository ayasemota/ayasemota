"use client";

import { useState } from "react";
import Modal from "./Modal";
import { User } from "@ayz/types";
import { Calendar, Clock } from "lucide-react";
import { useToast } from "./ToastContext";

interface AddPaymentModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onAddPayment: (
    payment: {
      userEmail: string;
      userName: string;
      userId: string;
      amount: number;
      status: string;
      reference: string;
      date: string;
      paymentDate?: string;
      paymentTime?: string;
    },
    customId?: string,
  ) => Promise<string | void>;
}

export default function AddPaymentModal({
  isOpen,
  user,
  onClose,
  onAddPayment,
}: AddPaymentModalProps) {
  const { showToast } = useToast();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Completed");
  const [reference, setReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [paymentTime, setPaymentTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  );
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount.replace(/,/g, "")) <= 0) return;

    setIsAdding(true);
    try {
      const paymentData = {
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        userId: user.id || "",
        amount: parseFloat(amount.replace(/,/g, "")),
        status,
        reference: reference || `REF-${Date.now()}`,
        date,
        paymentDate,
        paymentTime,
      };

      const newId = await onAddPayment(paymentData);

      if (newId) {
        showToast("Payment created successfully");
      }

      setAmount("");
      setStatus("Completed");
      setReference("");
      const now = new Date();
      setPaymentDate(now.toISOString().split("T")[0]);
      setPaymentTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      setDate(
        now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      );
      onClose();
    } catch (error) {
      console.error("Error adding payment:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Payment" size="md">
      <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
              User
            </label>
            <p className="text-gray-900 px-3 py-2 bg-gray-100 rounded-lg">
              {user.firstName} {user.lastName} ({user.email})
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
              Amount *
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                const numValue = e.target.value.replace(/,/g, "");
                if (numValue === "" || /^\d*\.?\d*$/.test(numValue)) {
                  const formatted = numValue
                    ? parseFloat(numValue).toLocaleString()
                    : "";
                  setAmount(formatted);
                }
              }}
              placeholder="0"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
              Reference
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Auto-generated if empty"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 flex items-center gap-2">
                <Clock size={16} />
                Payment Time
              </label>
              <input
                type="time"
                value={paymentTime}
                onChange={(e) => setPaymentTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isAdding || !amount}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "Adding..." : "Add Payment"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
