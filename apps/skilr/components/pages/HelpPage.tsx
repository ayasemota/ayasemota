export const HelpPage = () => (
  <div className="space-y-6">
    <div className="bg-linear-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Help & Support</h1>
      <p className="text-gray-400">Find answers to commonly asked questions</p>
    </div>
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
          <h3 className="font-semibold text-white mb-2">
            How do I make a payment?
          </h3>
          <p className="text-sm text-gray-400">
            Navigate to the Payments page from the sidebar, enter the amount you
            wish to pay, and click Continue to review your payment summary
            before confirming.
          </p>
        </div>
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
          <h3 className="font-semibold text-white mb-2">
            What payment methods are accepted?
          </h3>
          <p className="text-sm text-gray-400">
            We accept various payment methods including bank transfers, card
            payments, and mobile money. All transactions are processed securely.
          </p>
        </div>
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
          <h3 className="font-semibold text-white mb-2">
            How can I view my payment history?
          </h3>
          <p className="text-sm text-gray-400">
            Your complete payment history is available on the Payments page. You
            can see all transactions including dates, amounts, and status.
          </p>
        </div>
      </div>
    </div>
  </div>
);
