import { useEffect } from "react";

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

export const usePaystack = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializePayment = (config: PaystackProps) => {
    if (!window.PaystackPop) {
      console.error("Paystack script not loaded");
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
