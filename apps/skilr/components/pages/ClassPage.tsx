import { Rocket, ExternalLink, Loader2 } from "lucide-react";
import { User } from "@ayasemota/types";

interface ClassPageProps {
  user: User;
}

const ensureAbsoluteUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

export const ClassPage = ({ user }: ClassPageProps) => {
  const hasClass = user.classLink && user.classLink.trim() !== "";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="relative overflow-hidden bg-linear-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-3xl p-8 md:p-12">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Rocket size={120} className="text-white" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Active Learning Group
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Your Digital <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">
              Learning Space
            </span>
          </h1>

          <p className="text-gray-400 max-w-xl text-lg">
            Connect with mentors and peers in your dedicated Telegram classroom. 
            Get real-time support, attend live sessions, and stay updated with your cohort.
          </p>

          <div className="pt-4">
            {hasClass ? (
              <a
                href={ensureAbsoluteUrl(user.classLink!)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 group"
              >
                Join Telegram Class
                <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            ) : (
              <div className="inline-flex flex-col gap-4">
                <div className="px-8 py-4 bg-gray-800/50 border border-gray-700/50 text-gray-400 rounded-2xl font-medium">
                  Status: Unenrolled / No Link Assigned
                </div>
                <p className="text-sm text-gray-500 italic max-w-sm">
                  If you have already paid, please contact support to have your account moved to an active learning group.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-6 space-y-3">
          <h3 className="font-semibold text-white">Need help?</h3>
          <p className="text-sm text-gray-400">
            If you're having trouble accessing your class, reach out to our technical support team on Telegram or Email.
          </p>
        </div>
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-6 space-y-3">
          <h3 className="font-semibold text-white">Important Note</h3>
          <p className="text-sm text-gray-400">
            Class links are private and should not be shared with anyone outside your cohort.
          </p>
        </div>
      </div>
    </div>
  );
};
