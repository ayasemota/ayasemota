interface PaystackProps {
  email: string;
  amount: number;
  publicKey: string;
  text?: string;
  onSuccess: (response: PaystackResponse) => void;
  onClose: () => void;
  firstname?: string;
  lastname?: string;
  phone?: string;
  ref?: string;
}

interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
  trxref: string;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  ref: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  metadata?: {
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
}

const PAYSTACK_READY_TIMEOUT_MS = 5000;
const PAYSTACK_POLL_INTERVAL_MS = 100;

const waitForPaystack = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.PaystackPop) {
      resolve();
      return;
    }

    const start = Date.now();
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.PaystackPop) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - start >= PAYSTACK_READY_TIMEOUT_MS) {
        clearInterval(interval);
        reject(new Error("Paystack script failed to load. Please refresh and try again."));
      }
    }, PAYSTACK_POLL_INTERVAL_MS);
  });
};

export const usePaystack = () => {
  const initializePayment = async (config: PaystackProps) => {
    try {
      await waitForPaystack();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Paystack unavailable";
      alert(message);
      config.onClose();
      return;
    }

    const handler = window.PaystackPop.setup({
      key: config.publicKey,
      email: config.email,
      amount: config.amount,
      ref: config.ref || `${Date.now()}`,
      firstname: config.firstname,
      lastname: config.lastname,
      phone: config.phone,
      metadata: {
        custom_fields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: `${config.firstname} ${config.lastname}`,
          },
          {
            display_name: "Phone Number",
            variable_name: "phone_number",
            value: config.phone || "",
          },
        ],
      },
      callback: (response: PaystackResponse) => {
        config.onSuccess(response);
      },
      onClose: () => {
        config.onClose();
      },
    });

    handler.openIframe();
  };

  return { initializePayment };
};
