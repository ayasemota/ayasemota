"use client";

import { useState } from "react";
import Modal from "./Modal";
import { User, Payment } from "@ayasemota/types";
import { Plus } from "lucide-react";
import AddPaymentModal from "./AddPaymentModal";

import { useToast } from "./ToastContext";

interface UserDetailModalProps {
  isOpen: boolean;
  user: User | null;
  payments: Payment[];
  onClose: () => void;
  onUserUpdate: (userId: string, updates: Partial<User>) => void;
  onPaymentSelect: (payment: Payment) => void;
  onAddPayment: (payment: {
    userEmail: string;
    userName: string;
    userId: string;
    amount: number;
    status: string;
    reference: string;
    date: string;
    paymentDate?: string;
  }) => Promise<void>;
  onDeletePayment: (paymentId: string) => Promise<void>;
}

export default function UserDetailModal({
  isOpen,
  user,
  payments,
  onClose,
  onUserUpdate,
  onPaymentSelect,
  onAddPayment,
  onDeletePayment,
}: UserDetailModalProps) {
  const [editedUser, setEditedUser] = useState<User | null>(user);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const { showToast, addAction } = useToast();

  if (!user || !editedUser) return null;

  const userPayments = payments.filter(
    (p) => p.userEmail === user.email || p.userId === user.id,
  );

  const getPaymentDateTime = (payment: Payment) => {
    if (payment.paymentDate && payment.paymentTime) {
      const datePart = new Date(payment.paymentDate).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        },
      );
      return `${datePart} at ${payment.paymentTime}`;
    }

    if (
      payment.createdAt &&
      typeof payment.createdAt === "object" &&
      "seconds" in payment.createdAt
    ) {
      const date = new Date(payment.createdAt.seconds * 1000);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timeStr = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return `${dateStr} at ${timeStr}`;
    }
    return payment.date || "N/A";
  };

  const handleFieldChange = (field: keyof User, value: string) => {
    setEditedUser({ ...editedUser, [field]: value });
  };

  const handleSave = async () => {
    if (!user.id) return;

    const previousValues: Partial<User> = {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      status: user.status,
      unclearedAmount: user.unclearedAmount,
    };

    try {
      const unclearedAmount = editedUser.unclearedAmount
        ? parseFloat(String(editedUser.unclearedAmount).replace(/,/g, ""))
        : 0;
      const newValues = {
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        phone: editedUser.phone,
        status: editedUser.status || "",
        unclearedAmount: unclearedAmount,
      };
      await onUserUpdate(user.id, newValues);

      const userId = user.id;

      const changes: { field: string; from: string; to: string }[] = [];
      if (previousValues.firstName !== newValues.firstName) {
        changes.push({
          field: "First Name",
          from: previousValues.firstName || "",
          to: newValues.firstName || "",
        });
      }
      if (previousValues.lastName !== newValues.lastName) {
        changes.push({
          field: "Last Name",
          from: previousValues.lastName || "",
          to: newValues.lastName || "",
        });
      }
      if (previousValues.phone !== newValues.phone) {
        changes.push({
          field: "Phone",
          from: previousValues.phone || "",
          to: newValues.phone || "",
        });
      }
      if (previousValues.status !== newValues.status) {
        changes.push({
          field: "Status",
          from: previousValues.status || "",
          to: newValues.status || "",
        });
      }
      if (previousValues.unclearedAmount !== newValues.unclearedAmount) {
        changes.push({
          field: "Uncleared",
          from: String(previousValues.unclearedAmount || 0),
          to: String(newValues.unclearedAmount || 0),
        });
      }

      if (changes.length > 0) {
        addAction(
          `Updated ${editedUser.firstName} ${editedUser.lastName}`,
          async () => {
            await onUserUpdate(userId, previousValues);
            setEditedUser((prev) =>
              prev ? { ...prev, ...previousValues } : prev,
            );
          },
          async () => {
            await onUserUpdate(userId, newValues);
            setEditedUser((prev) => (prev ? { ...prev, ...newValues } : prev));
          },
          { changes },
        );
      }
    } catch (error) {
      console.error("Error saving user:", error);
      showToast("Failed to save");
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
        <div className="p-4 md:p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 md:p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
                First Name
              </label>
              <input
                type="text"
                value={editedUser.firstName || ""}
                onChange={(e) => handleFieldChange("firstName", e.target.value)}
                onBlur={handleSave}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={editedUser.lastName || ""}
                onChange={(e) => handleFieldChange("lastName", e.target.value)}
                onBlur={handleSave}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
                Email
              </label>
              <p className="text-gray-900 px-3 py-2 bg-gray-100 rounded-lg break-all">
                {editedUser.email || "N/A"}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
                Phone
              </label>
              <input
                type="text"
                value={editedUser.phone || ""}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                onBlur={handleSave}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
                Account Status
              </label>
              <input
                type="text"
                value={editedUser.status || ""}
                onChange={(e) => handleFieldChange("status", e.target.value)}
                onBlur={handleSave}
                placeholder="Enter status (e.g., Confirmed, Unconfirmed)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
                Uncleared Amount
              </label>
              <input
                type="text"
                value={
                  editedUser.unclearedAmount
                    ? String(editedUser.unclearedAmount).replace(
                        /\B(?=(\d{3})+(?!\d))/g,
                        ",",
                      )
                    : ""
                }
                onChange={(e) => {
                  const numValue = e.target.value.replace(/,/g, "");
                  if (numValue === "" || /^\d*$/.test(numValue)) {
                    const amount =
                      numValue === "" ? 0 : parseInt(numValue) || 0;
                    setEditedUser({ ...editedUser, unclearedAmount: amount });
                  }
                }}
                onBlur={handleSave}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base md:text-lg font-semibold text-gray-900">
                Payment History
              </h4>
              <button
                onClick={() => setShowAddPayment(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus size={18} />
                Add Payment
              </button>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-125">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Reference
                      </th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {userPayments.length > 0 ? (
                      userPayments.map((payment) => (
                        <tr
                          key={payment.id}
                          onClick={() => onPaymentSelect(payment)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-3 md:px-4 py-3 text-sm font-medium text-gray-900">
                            {payment.reference || payment.id}
                          </td>
                          <td className="px-3 md:px-4 py-3 text-sm font-semibold text-gray-900">
                            ₦{payment.amount.toLocaleString()}
                          </td>
                          <td className="px-3 md:px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                payment.status === "Completed" ||
                                payment.status === "success"
                                  ? "bg-green-100 text-green-800"
                                  : payment.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-3 md:px-4 py-3 text-sm text-gray-600">
                            {getPaymentDateTime(payment)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 md:px-4 py-8 text-center text-gray-500"
                        >
                          No payments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {user && (
        <AddPaymentModal
          isOpen={showAddPayment}
          user={user}
          onClose={() => setShowAddPayment(false)}
          onAddPayment={onAddPayment}
          onDeletePayment={onDeletePayment}
        />
      )}
    </>
  );
}
