import { useEffect, useState } from "react";
import { CheckCircle2, Database, LockKeyhole, Search, ShieldCheck } from "lucide-react";

import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { fetchPublicDataset, type PublicDataset } from "../utils/publicData";

interface BetaPageProps {
  onNavigate: (path: string) => void;
}

const initialDataset: PublicDataset = {
  facultyData: [],
  papersData: [],
  patentsData: [],
  projectsData: [],
};

export function BetaPage({ onNavigate }: BetaPageProps) {
  const [dataset, setDataset] = useState<PublicDataset>(initialDataset);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchPublicDataset()
      .then((data) => {
        if (!cancelled) {
          setDataset(data);
          setLoadError("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError("Live beta data is temporarily unavailable.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    { label: "Faculty profiles", value: dataset.facultyData.length },
    { label: "Approved publications", value: dataset.papersData.length },
    { label: "Patents", value: dataset.patentsData.length },
    { label: "Projects", value: dataset.projectsData.length },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar onNavigate={onNavigate} currentPath="/beta" />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-[#fff9e6] to-white px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#8b0000] px-4 py-2 text-sm font-medium text-[#ffd100] mb-6">
              <CheckCircle2 className="h-4 w-4" />
              Public beta is live
            </div>
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <h1 className="text-4xl md:text-5xl font-light text-gray-950 mb-5">
                  SCOUP Beta Launch
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed font-light max-w-2xl">
                  This public beta exposes approved faculty and publication data while keeping ambiguous records in private administrative review. The goal is a useful, credible discovery experience that can expand as more records are verified.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Live data snapshot
                </p>
                {loadError ? (
                  <p className="text-sm text-red-700">{loadError}</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((item) => (
                      <div key={item.label} className="rounded-lg bg-gray-50 p-4">
                        <div className="text-2xl font-light text-[#8b0000]">
                          {item.value.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{item.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-14">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <Search className="h-6 w-6 text-[#8b0000] mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Discovery is active</h2>
              <p className="text-sm leading-relaxed text-gray-600">
                Public search supports faculty, papers, patents, and projects with confidence-aware ranking and filtering.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <ShieldCheck className="h-6 w-6 text-[#8b0000] mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Approved data only</h2>
              <p className="text-sm leading-relaxed text-gray-600">
                Public endpoints only expose records that have cleared the current review-status trust boundary.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <LockKeyhole className="h-6 w-6 text-[#8b0000] mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Review backlog stays private</h2>
              <p className="text-sm leading-relaxed text-gray-600">
                Ambiguous publication records remain in an authenticated administrative queue for controlled review.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-xl bg-[#8b0000] p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#ffd100] text-sm font-medium mb-2">
                <Database className="h-4 w-4" />
                Beta scope
              </div>
              <p className="text-lg font-light leading-relaxed max-w-2xl">
                The beta is ready for client review with search, browsing, public faculty profiles, and inquiry flows available on the live site.
              </p>
            </div>
            <button
              onClick={() => onNavigate("/")}
              className="shrink-0 rounded-full bg-[#ffd100] px-5 py-3 text-sm font-semibold text-[#8b0000] hover:bg-[#f0c500] transition-colors"
            >
              Return to Search
            </button>
          </div>
        </section>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}