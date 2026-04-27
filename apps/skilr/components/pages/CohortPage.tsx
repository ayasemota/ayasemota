import { Rocket, ExternalLink } from "lucide-react";
import { User } from "@ayasemota/types";
import { useSettings } from "@/hooks/useSettings";

interface CohortPageProps {
  user: User;
}

const ensureAbsoluteUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
};

export const CohortPage = ({ user }: CohortPageProps) => {
  const { settings } = useSettings();
  const hasClass = user.classLink && user.classLink.trim() !== "";
  const sections = settings?.cohortRules || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="relative overflow-hidden bg-linear-to-br from-blue-600/20 via-cyan-500/10 to-purple-600/20 border border-blue-500/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-blue-950/30">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Rocket size={120} className="text-white" />
        </div>
        <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Active Learning Group
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight">
            Welcome to Your <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">
              Cohort Space
            </span>
          </h1>

          <p className="text-gray-300 max-w-2xl text-base md:text-lg leading-relaxed">
            Connect with mentors and peers in your dedicated Telegram classroom.
            Get real-time support, attend live sessions, and stay updated with
            your cohort.
          </p>

          <p className="text-sm text-gray-400">
            Please review the class rules below before joining your live
            learning group.
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-300/80">
              Program Policy
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Class Rules
            </h2>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-auto-fit">
          {sections.map((section, sectionIndex) => (
            <article
              key={section?.title || `section-${sectionIndex}`}
              className="h-full bg-gray-800/45 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-blue-500/30 transition-colors duration-300"
            >
              <div className="inline-flex items-center justify-center h-8 min-w-8 px-2 rounded-lg bg-blue-500/15 text-blue-300 text-sm font-semibold mb-4">
                {sectionIndex + 1}
              </div>
              <h3 className="text-lg font-semibold text-white mb-4">
                {section?.title || "Section"}
              </h3>
              <div className="space-y-2">
                {(section?.points || []).map((point, pointIndex) => (
                  <div
                    key={`${sectionIndex}-${pointIndex}`}
                    className="flex items-start gap-2 rounded-lg bg-gray-900/45 border border-gray-700/30 px-3 py-2"
                  >
                    <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500/15 text-blue-300 text-[11px] font-semibold">
                      {pointIndex + 1}
                    </span>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-gray-900/60 border border-gray-700/50 rounded-3xl p-6 md:p-8 backdrop-blur-sm space-y-4">
        <div>
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            Class Access
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Once you are enrolled, use your private link below to join your
            Telegram class.
          </p>
        </div>

        <div className="pt-1">
          {hasClass ? (
            <a
              href={ensureAbsoluteUrl(user.classLink!)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 group"
            >
              Join Telegram Class
              <ExternalLink
                size={20}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </a>
          ) : (
            <div className="inline-flex flex-col gap-3">
              <div className="px-5 py-3 bg-gray-800/60 border border-gray-700/50 text-gray-300 rounded-xl font-medium w-fit">
                Status: Unenrolled
              </div>
              <p className="text-sm text-gray-400 italic max-w-xl leading-relaxed">
                If you have already paid, please contact support to have your
                account moved to an active learning group.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
