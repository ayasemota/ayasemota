import { useState, useMemo } from "react";
import { User as UserIcon, Mail, Phone, Copy, CheckCheck } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { User as UserType, Payment, PaystackResponse } from "@ayz/types";
import { PAYSTACK_PUBLIC_KEY, convertToKobo } from "@ayz/paystack";
import { usePaystack } from "@/hooks/usePaystack";
import { usePayments } from "@/hooks/usePayments";
import { useSettings } from "@/hooks/useSettings";

interface PaymentsPageProps {
  user: UserType;
  payments: Payment[];
  paymentsLoading: boolean;
  updateUnclearedAmount?: (email: string, amount: number) => Promise<void>;
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getRandomTransactionFee = (min: number, max: number) => {
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);

  if (safeMin === safeMax) {
    return Number(safeMin.toFixed(2));
  }

  return Number((Math.random() * (safeMax - safeMin) + safeMin).toFixed(2));
};

const getPaymentDateTime = (payment: Payment) => {
  if (payment.paymentDate && payment.paymentTime) {
    const datePart = new Date(payment.paymentDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${datePart} at ${payment.paymentTime}`;
  }

  if (payment.paymentDate) {
    const datePart = new Date(payment.paymentDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return datePart;
  }

  if (
    payment.createdAt &&
    typeof payment.createdAt === "object" &&
    "seconds" in payment.createdAt
  ) {
    const date = new Date(payment.createdAt.seconds * 1000);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yy} | ${hh}:${min}`;
  }
  return payment.date || "N/A";
};

export const PaymentsPage = ({
  user,
  payments,
  paymentsLoading,
  updateUnclearedAmount,
}: PaymentsPageProps) => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isCheckout, setIsCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [checkoutTransactionFee, setCheckoutTransactionFee] = useState(0);
  const { initializePayment } = usePaystack();
  const { addPayment, updatePayment } = usePayments(user.email);
  const { settings } = useSettings();
  const vatRate = settings.vatRate ?? 0;
  const transactionFeeMin = settings.transactionFeeMin ?? 0;
  const transactionFeeMax = settings.transactionFeeMax ?? 0;
  const transactionFee = checkoutTransactionFee;

  const formatInputValue = (value: string): string => {
    const numericValue = value.replace(/,/g, "");
    if (!numericValue) return "";
    const num = parseFloat(numericValue);
    if (isNaN(num)) return "";
    if (num > 1000000) return "1,000,000";
    return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (rawValue === "" || /^\d+$/.test(rawValue)) {
      const numValue = parseFloat(rawValue);
      if (isNaN(numValue) || numValue <= 1000000) {
        setPaymentAmount(rawValue);
      }
    }
  };

  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(text);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const stats = useMemo(() => {
    const total = payments
      .filter((p) => p.status === "Completed")
      .reduce((sum, p) => sum + p.amount, 0);
    return { total };
  }, [payments]);

  const baseAmount = paymentAmount ? parseFloat(paymentAmount) : 0;
  const vat = Number((baseAmount * (vatRate / 100)).toFixed(2));
  const total = baseAmount + vat + transactionFee;

  const handleContinue = () => {
    if (paymentAmount && parseFloat(paymentAmount) > 0) {
      setCheckoutTransactionFee(
        getRandomTransactionFee(transactionFeeMin, transactionFeeMax),
      );
      setIsCheckout(true);
    }
  };

  const handleConfirmPayment = async () => {
    setProcessing(true);
    const transactionRef = `SKILR-${Date.now()}`;

    let paymentDocId: string | undefined;

    try {
      const now = new Date();
      const paymentDate = now.toISOString().split("T")[0];
      const paymentTime = now.toTimeString().slice(0, 5);

      const pendingPayment: Omit<Payment, "id"> = {
        amount: baseAmount,
        date: new Date(now.getTime() - 86400000).toISOString().split("T")[0],
        paymentDate: paymentDate,
        paymentTime: paymentTime,
        status: "Pending",
        reference: transactionRef,
        userEmail: user.email,
        createdAt: Timestamp.now(),
      };

      paymentDocId = await addPayment(pendingPayment, user.email);
    } catch (error) {
      console.error("Error saving pending payment:", error);
      setProcessing(false);
      return;
    }

    await initializePayment({
      email: user.email,
      amount: convertToKobo(total),
      publicKey: PAYSTACK_PUBLIC_KEY,
      firstname: user.firstName,
      lastname: user.lastName,
      phone: user.phone,
      ref: transactionRef,
      onSuccess: async (response: PaystackResponse) => {
        try {
          if (paymentDocId) {
            await updatePayment(paymentDocId, {
              status: "Completed",
              reference: response.reference,
            });
          }

          if (updateUnclearedAmount) {
            await updateUnclearedAmount(user.email, baseAmount);
          }

          setShowSuccess(true);
          setIsCheckout(false);
          setPaymentAmount("");
          setCheckoutTransactionFee(0);
          setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
          console.error("Error updating payment:", error);
        } finally {
          setProcessing(false);
        }
      },
      onClose: async () => {
        try {
          if (paymentDocId) {
            await updatePayment(paymentDocId, {
              status: "Failed",
            });
          }
          setShowFailed(true);
          setTimeout(() => setShowFailed(false), 3000);
        } catch (error) {
          console.error("Error updating failed payment:", error);
        } finally {
          setProcessing(false);
          setIsCheckout(false);
          setCheckoutTransactionFee(0);
        }
      },
    });
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
            <svg
              className="w-10 h-10 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
          <p className="text-gray-400">
            Your payment has been processed successfully
          </p>
        </div>
      </div>
    );
  }

  if (showFailed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Payment Failed</h2>
          <p className="text-gray-400">
            Your payment was not completed. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (isCheckout) {
    return (
      <div className="max-w-md mx-auto">
        <button
          onClick={() => setIsCheckout(false)}
          className="text-gray-400 hover:text-white mb-6 transition-colors duration-300"
        >
          ← Back
        </button>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-white">Payment Summary</h2>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30 space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Amount</span>
                <span>₦{formatCurrency(baseAmount)}</span>
              </div>
              {vatRate > 0 && (
                <div className="flex justify-between text-gray-300">
                  <span>VAT ({vatRate}%)</span>
                  <span>₦{formatCurrency(vat)}</span>
                </div>
              )}
              {transactionFee > 0 && (
                <div className="flex justify-between text-gray-300">
                  <span>Transaction Fee</span>
                  <span>₦{formatCurrency(transactionFee)}</span>
                </div>
              )}
              <div className="border-t border-gray-700/50 pt-2 mt-2"></div>
              <div className="flex justify-between text-white font-bold text-lg">
                <span>Total</span>
                <span>₦{formatCurrency(total)}</span>
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
              <div className="flex items-center gap-3 mb-3">
                <UserIcon className="text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-white">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Mail className="text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-white">{user.phone}</p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleConfirmPayment}
            disabled={processing}
            className="w-full py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg disabled:opacity-50"
          >
            {processing ? "Processing..." : `Pay ₦${formatCurrency(total)}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-linear-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">
            Total Amount Paid
          </h3>
          <p className="text-3xl font-bold text-white">
            {paymentsLoading ? (
              <span className="text-xl">Loading...</span>
            ) : (
              `₦${formatCurrency(stats.total)}`
            )}
          </p>
        </div>
        <div className="bg-linear-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">
            Uncleared Amount
          </h3>
          <p className="text-3xl font-bold text-white">
            ₦{formatCurrency(user.unclearedAmount || 0)}
          </p>
        </div>
        <div className="bg-linear-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">
            Total Transactions
          </h3>
          <p className="text-3xl font-bold text-white">
            {paymentsLoading ? "..." : payments.length}
          </p>
        </div>
      </div>
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Make a Payment</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount to Pay (₦)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formatInputValue(paymentAmount)}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors duration-300"
            />
          </div>
          <button
            onClick={handleContinue}
            disabled={!paymentAmount || parseFloat(paymentAmount) < 100}
            className="w-full py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Payment History</h2>
        {paymentsLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 text-sm mt-4">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No payment history yet</p>
            <p className="text-gray-500 text-xs mt-1">
              Your payments will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/30">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Reference
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-700/10 hover:bg-gray-700/10 transition-colors duration-300"
                  >
                    <td className="py-4 px-4 text-gray-300">
                      {getPaymentDateTime(payment)}
                    </td>
                    <td className="py-4 px-4 text-white font-medium">
                      ₦{formatCurrency(payment.amount)}
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-30">
                          {payment.reference || "N/A"}
                        </span>
                        {payment.reference && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(payment.reference!);
                            }}
                            className="p-1 hover:bg-gray-700/50 rounded transition-colors text-gray-500 hover:text-blue-400"
                            title="Copy Reference"
                          >
                            {copiedRef === payment.reference ? (
                              <CheckCheck
                                size={14}
                                className="text-green-400"
                              />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full border ${
                          payment.status === "Completed"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : payment.status === "Pending"
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              : payment.status === "Failed"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
