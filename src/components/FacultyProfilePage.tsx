import { useEffect, useState } from "react";
import {
  BadgeCheck,
  ChevronLeft,
  ExternalLink,
  FileText,
  MapPin,
  Phone,
  UserX,
} from "lucide-react";

import { publicProfileAPI, type PublicFacultyProfile } from "../utils/api";
import { getInitials } from "../utils/avatar";

interface FacultyProfilePageProps {
  /** Raw `:id` segment from the path — validated here, not by the router. */
  facultyId: string;
  onNavigate: (path: string) => void;
}

/**
 * Public, read-only faculty profile backed by `GET /faculty/<pk>/public/`.
 *
 * The endpoint returns 404 for anyone whose profile is hidden or whose review
 * was rejected, which is a normal outcome rather than a failure — so a 404 is
 * rendered as "profile not available" and any other error as a real error.
 *
 * No email address is shown. The endpoint deliberately withholds it; contact
 * runs through the throttled inquiry flow on the category pages instead.
 */
export function FacultyProfilePage({ facultyId, onNavigate }: FacultyProfilePageProps) {
  const [profile, setProfile] = useState<PublicFacultyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notAvailable, setNotAvailable] = useState(false);
  const [badId, setBadId] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setNotAvailable(false);
    setBadId(false);
    setError("");
    setProfile(null);

    // Profile ids are numeric. A malformed one is a bad address, not a hidden
    // profile, so say that rather than sending a doomed request.
    if (!/^\d+$/.test(facultyId)) {
      setBadId(true);
      setLoading(false);
      return;
    }

    publicProfileAPI
      .get(facultyId)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const status = (err as { status?: number })?.status;
        if (status === 404) {
          setNotAvailable(true);
        } else {
          setError(
            (err as Error)?.message || "Unable to load this profile right now.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [facultyId]);

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      onNavigate("/experts");
    }
  };

  const backButton = (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#8b0000] mb-4"
    >
      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
      Back
    </button>
  );

  if (loading) {
    return (
      <div className="p-8 max-w-5xl">
        {backButton}
        <p className="text-sm text-gray-500">Loading profile…</p>
      </div>
    );
  }

  if (badId) {
    return (
      <div className="p-8 max-w-3xl">
        {backButton}
        <div className="border border-gray-200 rounded-lg bg-white p-6">
          <div className="flex items-center gap-2 text-gray-700">
            <UserX className="w-5 h-5 text-gray-400" aria-hidden="true" />
            <h1 className="text-lg font-semibold text-gray-900">
              That is not a profile address
            </h1>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Profile addresses look like <span className="text-gray-900">/faculty/405</span>.
            &ldquo;{facultyId}&rdquo; is not a profile id, so there is nothing to look up.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              onClick={() => onNavigate("/experts")}
              className="text-sm font-medium text-white bg-[#8b0000] hover:shadow-md rounded-md px-4 py-2 transition-shadow"
            >
              Browse experts
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (notAvailable) {
    return (
      <div className="p-8 max-w-3xl">
        {backButton}
        <div className="border border-gray-200 rounded-lg bg-white p-6">
          <div className="flex items-center gap-2 text-gray-700">
            <UserX className="w-5 h-5 text-gray-400" aria-hidden="true" />
            <h1 className="text-lg font-semibold text-gray-900">Profile not available</h1>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            This profile is not published. Faculty choose whether their profile is
            publicly visible, and records still awaiting review are not shown, so a
            missing profile here does not mean the person is missing from the network.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              onClick={() => onNavigate("/experts")}
              className="text-sm font-medium text-white bg-[#8b0000] hover:shadow-md rounded-md px-4 py-2 transition-shadow"
            >
              Browse experts
            </button>
            <button
              type="button"
              onClick={() => onNavigate("/search")}
              className="text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-md px-4 py-2 transition-colors"
            >
              Search publications
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 max-w-3xl">
        {backButton}
        <div className="border border-gray-200 rounded-lg bg-white p-6">
          <h1 className="text-lg font-semibold text-gray-900">
            Could not load this profile
          </h1>
          <p className="text-sm text-red-600 mt-3" role="alert">
            {error || "The server returned no profile data."}
          </p>
          <p className="text-sm text-gray-600 mt-3">
            This is a request failure, not a hidden profile. Reloading the page may
            resolve it.
          </p>
        </div>
      </div>
    );
  }

  const affiliation = [profile.title, profile.department].filter(Boolean).join(" · ");
  const hasContact = Boolean(profile.room || profile.phone || profile.orcid);
  // `expertise` is a free-form JSON list on the model and is empty for most
  // records; `keywords` is the populated field. Show whichever exists.
  const expertise = Array.isArray(profile.expertise) ? profile.expertise : [];
  const topics = expertise.length > 0 ? expertise : profile.keywords || [];

  const metrics = [
    { label: "Papers", value: profile.articleCount.toLocaleString() },
    { label: "Total citations", value: profile.totalCitations.toLocaleString() },
    { label: "Average citations", value: profile.averageCitations.toLocaleString() },
  ];

  return (
    <div className="p-8 max-w-5xl">
      {backButton}

      <header className="border border-gray-200 rounded-lg bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt={profile.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-[#8b0000] text-white flex items-center justify-center text-2xl font-semibold">
                {getInitials(profile.name)}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">{profile.name}</h1>
              {profile.directoryVerified && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                  <BadgeCheck className="w-3 h-3" aria-hidden="true" />
                  Directory verified
                </span>
              )}
            </div>
            {affiliation && <p className="text-sm text-gray-700 mt-1">{affiliation}</p>}
            {profile.school && (
              <p className="text-sm text-gray-500 mt-1">{profile.school}</p>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-gray-700 leading-relaxed mt-4">{profile.bio}</p>
        )}
      </header>

      <dl className="grid gap-3 md:grid-cols-3 mt-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="border border-gray-200 rounded-lg bg-white px-4 py-3">
            <dt className="text-xs text-gray-500">{metric.label}</dt>
            <dd className="text-xl font-semibold text-gray-900">{metric.value}</dd>
          </div>
        ))}
      </dl>

      {(hasContact || topics.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2 items-start mt-6">
          {hasContact && (
            <section className="border border-gray-200 rounded-lg bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Contact</h2>
              <dl className="space-y-2 text-sm">
                {profile.room && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                    <dt className="text-gray-500">Office</dt>
                    <dd className="text-gray-900">{profile.room}</dd>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                    <dt className="text-gray-500">Campus extension</dt>
                    <dd className="text-gray-900">{profile.phone}</dd>
                  </div>
                )}
                {profile.orcid && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                    <dt className="text-gray-500">ORCID</dt>
                    <dd className="min-w-0">
                      <a
                        href={`https://orcid.org/${profile.orcid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#8b0000] hover:underline"
                      >
                        {profile.orcid}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
              <p className="text-xs text-gray-400 mt-4">
                Only the details Salisbury University already publishes in its public
                directory are shown here.
              </p>
            </section>
          )}

          {topics.length > 0 && (
            <section className="border border-gray-200 rounded-lg bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Research topics</h2>
              <div className="flex flex-wrap gap-1">
                {topics.slice(0, 20).map((topic) => (
                  <span
                    key={topic}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Publications
        </h2>

        {profile.papers.length === 0 ? (
          <p className="text-sm text-gray-500">
            No publications are attributed to this profile in the SCOUP corpus.
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-3">
              {profile.papers.length === profile.articleCount
                ? `${profile.papers.length} paper${profile.papers.length === 1 ? "" : "s"}, most cited first.`
                : `Showing the ${profile.papers.length} most cited of ${profile.articleCount} papers.`}
            </p>
            <ul className="space-y-2">
              {profile.papers.map((paper) => {
                const href =
                  paper.url || (paper.doi ? `https://doi.org/${paper.doi}` : null);
                const meta = [paper.journal, paper.year].filter(Boolean).join(" · ");

                return (
                  <li
                    key={paper.id}
                    className="border border-gray-200 rounded-lg bg-white px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <FileText
                        className="w-4 h-4 text-gray-400 shrink-0 mt-1"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[#8b0000] hover:underline"
                          >
                            {paper.title}
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-gray-900">{paper.title}</p>
                        )}
                        {meta && <p className="text-xs text-gray-500 mt-1">{meta}</p>}
                      </div>
                      <span className="ml-auto text-xs text-gray-400 shrink-0">
                        {paper.citations} cited
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
