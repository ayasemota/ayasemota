"use client";

import { useMemo, useState, useCallback } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { Payment, User } from "@ayz/types";
import { TableSkeleton } from "@/components/Skeleton";

interface PaymentsSectionProps {
  payments: Payment[];
  users: User[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRefresh?: () => void;
  error?: string | null;
  onPaymentSelect: (payment: Payment) => void;
}

type SortField = "reference" | "userName" | "amount" | "status" | "date";
type SortDirection = "asc" | "desc";

export default function PaymentsSection({
  payments,
  users,
  loading,
  searchTerm,
  setSearchTerm,
  onRefresh,
  error,
  onPaymentSelect,
}: PaymentsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const getUserName = useCallback(
    (email: string | undefined) => {
      if (!email) return "N/A";
      const user = users.find((u) => u.email === email);
      if (user) {
        return `${user.firstName} ${user.lastName}`;
      }
      return email;
    },
    [users],
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

    if (payment.paymentDate) {
      return new Date(payment.paymentDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
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

  const getPaymentTimestamp = (payment: Payment) => {
    const dateValue = payment.paymentDate || payment.date;

    if (dateValue) {
      const dateTime = `${dateValue} ${payment.paymentTime || "00:00"}`;
      const parsed = new Date(dateTime).getTime();
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }

    if (
      payment.createdAt &&
      typeof payment.createdAt === "object" &&
      "seconds" in payment.createdAt
    ) {
      return payment.createdAt.seconds * 1000;
    }

    return 0;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedPayments = useMemo(() => {
    const filtered = payments.filter((payment) => {
      const matchesSearch =
        (payment.userName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ) ||
        (payment.userEmail?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ) ||
        (payment.id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (payment.reference?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        );

      const paymentStatus = (payment.status || "").toLowerCase().trim();
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && paymentStatus === "completed") ||
        (statusFilter === "pending" && paymentStatus === "pending") ||
        (statusFilter === "failed" && paymentStatus === "failed");

      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (sortField) {
        case "reference":
          aValue = (a.reference || a.id || "").toLowerCase();
          bValue = (b.reference || b.id || "").toLowerCase();
          break;
        case "userName":
          aValue = getUserName(a.userEmail).toLowerCase();
          bValue = getUserName(b.userEmail).toLowerCase();
          break;
        case "amount":
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        case "status":
          aValue = (a.status || "").toLowerCase();
          bValue = (b.status || "").toLowerCase();
          break;
        case "date":
          aValue = getPaymentTimestamp(a);
          bValue = getPaymentTimestamp(b);
          break;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    payments,
    searchTerm,
    statusFilter,
    sortField,
    sortDirection,
    getUserName,
  ]);

  const totalAmount = useMemo(() => {
    return filteredAndSortedPayments.reduce((sum, payment) => {
      const status = payment.status?.toLowerCase() || "";
      if (status === "completed") {
        return sum + (payment.amount || 0);
      }
      return sum;
    }, 0);
  }, [filteredAndSortedPayments]);

  const monthlyRevenue = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const isCurrentMonthPayment = (payment: Payment) => {
      if (payment.paymentDate) {
        const paymentDate = new Date(payment.paymentDate);
        if (!Number.isNaN(paymentDate.getTime())) {
          return (
            paymentDate.getMonth() === currentMonth &&
            paymentDate.getFullYear() === currentYear
          );
        }
      }

      if (
        payment.createdAt &&
        typeof payment.createdAt === "object" &&
        "seconds" in payment.createdAt
      ) {
        const paymentDate = new Date(payment.createdAt.seconds * 1000);
        return (
          paymentDate.getMonth() === currentMonth &&
          paymentDate.getFullYear() === currentYear
        );
      }

      return false;
    };

    return payments.reduce((sum, payment) => {
      const status = payment.status?.toLowerCase() || "";
      if (status === "completed" && isCurrentMonthPayment(payment)) {
        return sum + (payment.amount || 0);
      }
      return sum;
    }, 0);
  }, [payments]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: payments.length,
      completed: 0,
      failed: 0,
    };

    payments.forEach((payment) => {
      const status = payment.status?.toLowerCase() || "";
      if (status === "completed") {
        counts.completed++;
      } else if (status === "failed") {
        counts.failed++;
      }
    });

    return counts;
  }, [payments]);

  if (loading) {
    return <TableSkeleton rows={6} />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">Error loading payments</p>
        <p className="text-red-500 text-sm mt-2">{error}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Payments</p>
          <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {statusCounts.completed}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Monthly Revenue</p>
          <p className="text-2xl font-bold text-indigo-600">
            ₦{monthlyRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-blue-600">
            ₦{totalAmount.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by email, reference, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredAndSortedPayments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium">No payments found</p>
            <p className="text-sm mt-2">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Payments will appear here once users make transactions"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-160">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    onClick={() => handleSort("reference")}
                    className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Reference
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("userName")}
                    className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      User Name
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("amount")}
                    className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Amount
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("date")}
                    className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Date
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedPayments.map((payment, index) => (
                  <tr
                    key={payment.id || index}
                    onClick={() => onPaymentSelect(payment)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900">
                      {payment.reference || payment.id || "N/A"}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                      {getUserName(payment.userEmail)}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm font-semibold text-gray-900">
                      ₦{(payment.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          payment.status?.toLowerCase() === "completed"
                            ? "bg-green-100 text-green-800"
                            : payment.status?.toLowerCase() === "success"
                              ? "bg-blue-100 text-blue-800"
                              : payment.status?.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {(() => {
                          const status = payment.status?.toLowerCase() || "";
                          if (status === "completed") {
                            return "Completed";
                          } else if (status === "success") {
                            return "Success";
                          } else if (status === "pending") {
                            return "Pending";
                          } else {
                            return "Failed";
                          }
                        })()}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                      {getPaymentDateTime(payment)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 text-center">
        Showing {filteredAndSortedPayments.length} of {payments.length} payments
      </div>
    </div>
  );
}
