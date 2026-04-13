"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { User, Payment } from "@ayasemota/types";

interface UserDetailPanelProps {
  user: User;
  payments: Payment[];
  onClose: () => void;
  onUserUpdate: (userId: string, updates: Partial<User>) => void;
}

export default function UserDetailPanel({
  user,
  payments,
  onClose,
  onUserUpdate,
}: UserDetailPanelProps) {
  const [editedUser, setEditedUser] = useState(user);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const userPayments = payments.filter(
    (p) => p.userEmail === user.email || p.userId === user.id
  );

  const formatPaymentDateTime = (payment: Payment) => {
    if (payment.paymentDate && payment.paymentTime) {
      const datePart = new Date(payment.paymentDate).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
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

    setIsSaving(true);
    try {
      const updates = {
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        phone: editedUser.phone,
        status: editedUser.status || "",
      };
      await onUserUpdate(user.id, updates);
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex justify-end z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl h-full overflow-y-auto animate-slideIn shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
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
              <p className="text-gray-900 px-3 py-2 bg-gray-100 rounded-lg">
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
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Payment History
            </h4>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reference
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userPayments.length > 0 ? (
                    userPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {payment.reference || payment.id}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          ₦{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
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
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatPaymentDateTime(payment)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-gray-500"
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
    </div>
  );
}
