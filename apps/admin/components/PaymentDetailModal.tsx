"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { Payment, User } from "@ayz/types";
import { Trash2, Calendar, Clock } from "lucide-react";
import { useToast } from "./ToastContext";

interface PaymentDetailModalProps {
  isOpen: boolean;
  payment: Payment | null;
  users: User[];
  onClose: () => void;
  onPaymentUpdate: (
    paymentId: string,
    updates: Partial<Payment>,
  ) => Promise<void>;
  onPaymentDelete: (paymentId: string) => Promise<void>;
}

export default function PaymentDetailModal({
  isOpen,
  payment,
  users,
  onClose,
  onPaymentUpdate,
  onPaymentDelete,
}: PaymentDetailModalProps) {
  const { showToast } = useToast();
  const [editedPayment, setEditedPayment] = useState<Payment | null>(payment);
  const [, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (payment) {
      setEditedPayment({
        ...payment,
        amount: payment.amount || 0,
        status: payment.status || "Pending",
        reference: payment.reference || "",
        date: payment.date || "",
        paymentDate: payment.paymentDate || "",
        paymentTime: payment.paymentTime || "",
      });
    }
  }, [payment]);

  if (!payment || !editedPayment) return null;

  const getUserName = (email: string | undefined) => {
    if (!email) return "N/A";
    const user = users.find((u) => u.email === email);
    if (user) {
      return `${user.firstName} ${user.lastName}`;
    }
    return email;
  };

  const handleFieldChange = (field: keyof Payment, value: string | number) => {
    setEditedPayment({ ...editedPayment, [field]: value });
  };

  const handleSave = async () => {
    if (!payment.id) return;
    setIsSaving(true);
    try {
      const amountValue =
        typeof editedPayment.amount === "string"
          ? parseFloat(String(editedPayment.amount).replace(/,/g, ""))
          : editedPayment.amount;

      const updates: Partial<Payment> = {
        amount: amountValue,
        status: editedPayment.status,
        paymentDate: editedPayment.paymentDate,
        paymentTime: editedPayment.paymentTime,
      };

      await onPaymentUpdate(payment.id, updates);
      showToast("Payment updated successfully");
    } catch (error) {
      console.error("Error saving payment:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!payment.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this payment? This action cannot be undone.",
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onPaymentDelete(payment.id);
      showToast("Payment deleted successfully");
      onClose();
    } catch (error) {
      console.error("Error deleting payment:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Details" size="md">
      <div className="p-4 md:p-6 space-y-6">
        <div className="bg-gray-50 rounded-lg p-4 md:p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
              User Name
            </label>
            <p className="text-gray-900 px-3 py-2 bg-gray-100 rounded-lg">
              {getUserName(editedPayment.userEmail)}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
              User Email
            </label>
            <p className="text-gray-900 px-3 py-2 bg-gray-100 rounded-lg break-all">
              {editedPayment.userEmail || "N/A"}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
              Reference
            </label>
            <p className="text-gray-900 px-3 py-2 bg-gray-100 rounded-lg break-all">
              {editedPayment.reference || "N/A"}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
              Amount
            </label>
            <input
              type="text"
              value={
                editedPayment.amount
                  ? String(editedPayment.amount).replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ",",
                    )
                  : ""
              }
              onChange={(e) => {
                const numValue = e.target.value.replace(/,/g, "");
                if (numValue === "" || /^\d*\.?\d*$/.test(numValue)) {
                  const amount =
                    numValue === "" ? 0 : parseFloat(numValue) || 0;
                  setEditedPayment({ ...editedPayment, amount });
                }
              }}
              onBlur={handleSave}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
              Status
            </label>
            <select
              value={editedPayment.status}
              onChange={async (e) => {
                const newStatus = e.target.value;
                setEditedPayment({ ...editedPayment, status: newStatus });

                if (!payment.id) return;
                setIsSaving(true);
                try {
                  const amountValue =
                    typeof editedPayment.amount === "string"
                      ? parseFloat(
                          String(editedPayment.amount).replace(/,/g, ""),
                        )
                      : editedPayment.amount;

                  const updates: Partial<Payment> = {
                    amount: amountValue,
                    status: newStatus,
                    paymentDate: editedPayment.paymentDate,
                    paymentTime: editedPayment.paymentTime,
                  };

                  await onPaymentUpdate(payment.id, updates);
                } catch (error) {
                  console.error("Error saving payment:", error);
                } finally {
                  setIsSaving(false);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Payment Date
              </label>
              <input
                type="date"
                value={editedPayment.paymentDate || ""}
                onChange={(e) =>
                  handleFieldChange("paymentDate", e.target.value)
                }
                onBlur={handleSave}
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
                value={editedPayment.paymentTime || ""}
                onChange={(e) =>
                  handleFieldChange("paymentTime", e.target.value)
                }
                onBlur={handleSave}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Trash2 size={18} />
          {isDeleting ? "Deleting..." : "Delete Payment"}
        </button>
      </div>
    </Modal>
  );
}
