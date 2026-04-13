import { useState } from "react";
import { User as UserType } from "@/types";
import {
  User,
  Mail,
  Phone,
  Shield,
  Edit3,
  Save,
  X,
  Check,
  Bell,
  Moon,
  Globe,
} from "lucide-react";

interface SettingsPageProps {
  user: UserType;
  updateProfile: (fields: {
    firstName: string;
    lastName: string;
    phone: string;
  }) => Promise<void>;
}

export const SettingsPage = ({ user, updateProfile }: SettingsPageProps) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  });

  const [notifications, setNotifications] = useState({
    email: true,
    payments: true,
    announcements: false,
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Globe },
  ];

  const handleEdit = () => {
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    });
    setIsEditing(true);
    setError("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.phone) {
      setError("All fields are required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await updateProfile(form);
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Profile Updated!</h2>
          <p className="text-gray-400">
            Your profile has been updated successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent"
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-white">Profile</h2>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-all duration-300"
              >
                <Edit3 size={16} />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-all duration-300"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
                >
                  <Save size={16} />
                  <span>{saving ? "Saving..." : "Save"}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-700/30">
            <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-gray-400 text-sm">{user.email}</p>
              {user.status && (
                <span
                  className={`inline-block mt-2 px-3 py-1 text-xs rounded-full border ${
                    user.status === "Active"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : user.status === "Unconfirmed"
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                  }`}
                >
                  {user.status}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                  <User size={14} />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        firstName: e.target.value.replace(/\s/g, ""),
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors duration-300"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-900/30 rounded-lg text-white border border-gray-700/30">
                    {user.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                  <User size={14} />
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        lastName: e.target.value.replace(/\s/g, ""),
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors duration-300"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-900/30 rounded-lg text-white border border-gray-700/30">
                    {user.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                <Mail size={14} />
                Email
              </label>
              <p className="px-4 py-3 bg-gray-900/30 rounded-lg text-white border border-gray-700/30">
                {user.email}
              </p>
              {isEditing && (
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed.
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                <Phone size={14} />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value.trim() })
                  }
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors duration-300"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-900/30 rounded-lg text-white border border-gray-700/30">
                  {user.phone}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                <Shield size={14} />
                Account Status
              </label>
              <p className="px-4 py-3 bg-gray-900/30 rounded-lg text-white border border-gray-700/30">
                {user.status || "Pending"}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-700/30">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-sm text-gray-400">
                  Receive updates via email
                </p>
              </div>
              <button
                disabled
                className={`relative w-12 h-7 rounded-full transition-colors duration-300 opacity-50 cursor-not-allowed ${
                  notifications.email ? "bg-blue-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                    notifications.email ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-700/30">
              <div>
                <p className="text-white font-medium">Payment Alerts</p>
                <p className="text-sm text-gray-400">
                  Get notified about payment updates
                </p>
              </div>
              <button
                disabled
                className={`relative w-12 h-7 rounded-full transition-colors duration-300 opacity-50 cursor-not-allowed ${
                  notifications.payments ? "bg-blue-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                    notifications.payments ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-700/30">
              <div>
                <p className="text-white font-medium">Announcements</p>
                <p className="text-sm text-gray-400">
                  Receive announcement notifications
                </p>
              </div>
              <button
                disabled
                className={`relative w-12 h-7 rounded-full transition-colors duration-300 opacity-50 cursor-not-allowed ${
                  notifications.announcements ? "bg-blue-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                    notifications.announcements
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "preferences" && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Preferences</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-700/30">
              <div className="flex items-center gap-3 mb-3">
                <Moon size={18} className="text-gray-400" />
                <div>
                  <p className="text-white font-medium">Appearance</p>
                  <p className="text-sm text-gray-400">Dark mode is enabled</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-700/30">
              <div className="flex items-center gap-3 mb-3">
                <Globe size={18} className="text-gray-400" />
                <div>
                  <p className="text-white font-medium">Language</p>
                  <p className="text-sm text-gray-400">English (Default)</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-700/30">
              <div className="flex items-center gap-3 mb-3">
                <Shield size={18} className="text-gray-400" />
                <div>
                  <p className="text-white font-medium">Privacy</p>
                  <p className="text-sm text-gray-400">
                    Your data is securely stored and encrypted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
