"use client";

import { Clock, Lock, LogOut } from "lucide-react";

interface PendingApprovalOverlayProps {
  onSignOut: () => void;
  status?: string;
}

export const PendingApprovalOverlay = ({
  onSignOut,
}: PendingApprovalOverlayProps) => {
  return (
    <div className="pending-overlay p-6 backdrop-blur-xl">
      <div className="pending-card">
        <div className="pending-icon-container">
          <div className="pending-icon-bg">
            <Lock className="pending-icon pending-lock" />
          </div>
          <div className="pending-clock-badge">
            <Clock className="pending-icon pending-clock" />
          </div>
        </div>

        <h1 className="pending-title">Account Locked</h1>

        <p className="pending-description">
          Your account is currently locked. Contact your administrator for
          assistance.
        </p>

        <button onClick={onSignOut} className="pending-signout-btn">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
