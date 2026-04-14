"use client";

import { useMemo, useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { User } from "@ayasemota/types";
import { TableSkeleton } from "@/components/Skeleton";

interface UsersSectionProps {
  users: User[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  setSelectedUser: (user: User) => void;
}

type SortField = "name" | "email" | "phone" | "status";
type SortDirection = "asc" | "desc";

export default function UsersSection({
  users,
  loading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  setSelectedUser,
}: UsersSectionProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        (user.firstName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (user.lastName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());

      if (statusFilter === "all") return matchesSearch;
      if (statusFilter === "unconfirmed")
        return matchesSearch && (!user.status || user.status.trim() === "");
      if (statusFilter === "confirmed") return matchesSearch && user.status;
      return matchesSearch;
    });

    filtered.sort((a, b) => {
      let aValue = "";
      let bValue = "";

      switch (sortField) {
        case "name":
          aValue = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
          bValue = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();
          break;
        case "email":
          aValue = (a.email || "").toLowerCase();
          bValue = (b.email || "").toLowerCase();
          break;
        case "phone":
          aValue = (a.phone || "").toLowerCase();
          bValue = (b.phone || "").toLowerCase();
          break;
        case "status":
          aValue = (a.status || "").toLowerCase();
          bValue = (b.status || "").toLowerCase();
          break;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, searchTerm, statusFilter, sortField, sortDirection]);

  if (loading) {
    return <TableSkeleton rows={6} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All</option>
          <option value="confirmed">Confirmed</option>
          <option value="unconfirmed">Unconfirmed</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-160">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  onClick={() => handleSort("name")}
                  className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Name
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("email")}
                  className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Email
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("phone")}
                  className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Phone
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedUsers.length > 0 ? (
                filteredAndSortedUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                      {user.phone}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      {user.status ? (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.status.toLowerCase() === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No status</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 md:px-6 py-8 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-sm text-gray-500 text-center">
        Showing {filteredAndSortedUsers.length} of {users.length} users
      </div>
    </div>
  );
}
