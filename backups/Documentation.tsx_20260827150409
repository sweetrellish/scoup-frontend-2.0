import { useEffect, useState } from "react";
import { ExternalLink, Github, Globe, Code2, FileText } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { contactAPI } from "../utils/api";

interface Props {
  onNavigate: (path: string) => void;
}

interface DocLink {
  title: string;
  description: string;
  url: string;
}

const ensureHttps = (url: string) => {
  const t = (url || "").trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};

export function Documentation({ onNavigate }: Props) {
  const [frontendRepoUrl, setFrontendRepoUrl] = useState<string>("");
  const [backendRepoUrl, setBackendRepoUrl] = useState<string>("");
  const [docsUrl, setDocsUrl] = useState<string>("");
  const [apiDocsUrl, setApiDocsUrl] = useState<string>("");
  const [docLinks, setDocLinks] = useState<DocLink[]>([]);

  useEffect(() => {
    contactAPI
      .getSettings()
      .then((data: any) => {
        setFrontendRepoUrl(ensureHttps((data?.github_url || "").replace(/\/$/, "")));
        setBackendRepoUrl(ensureHttps((data?.backend_github_url || "").replace(/\/$/, "")));
        setDocsUrl(ensureHttps(data?.documentation_url || ""));
        setApiDocsUrl(ensureHttps(data?.api_documentation_url || ""));
        setDocLinks(
          (Array.isArray(data?.documentation_links) ? data.documentation_links : []).map(
            (l: DocLink) => ({ ...l, url: ensureHttps(l.url) })
          )
        );
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar onNavigate={onNavigate} currentPath="/docs" />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#fff9e6] to-white px-6 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Documentation
            </h1>
            <p className="text-lg text-gray-600 font-light">
              Technical references and guides for the SCOUP platform.
              All documents live in the project repository.
            </p>
          </div>
        </section>

        {/* Repositories */}
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Project Repositories</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {frontendRepoUrl && (
              <a href={frontendRepoUrl} target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#8b0000]/30 hover:shadow-sm transition-all bg-white">
                <Github className="w-5 h-5 text-gray-500 group-hover:text-[#8b0000] shrink-0 transition-colors" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-[#8b0000] transition-colors">SCOUP Frontend</p>
                  <p className="text-xs text-gray-400 truncate">{frontendRepoUrl}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#8b0000] shrink-0 ml-auto transition-colors" />
              </a>
            )}
            {backendRepoUrl && (
              <a href={backendRepoUrl} target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#8b0000]/30 hover:shadow-sm transition-all bg-white">
                <Github className="w-5 h-5 text-gray-500 group-hover:text-[#8b0000] shrink-0 transition-colors" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-[#8b0000] transition-colors">SCOUP Backend</p>
                  <p className="text-xs text-gray-400 truncate">{backendRepoUrl}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#8b0000] shrink-0 ml-auto transition-colors" />
              </a>
            )}
            <a href="https://github.com/Salisbury-University/2024Fall-COSC425-AcademicMetrics" target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#8b0000]/30 hover:shadow-sm transition-all bg-white">
              <Github className="w-5 h-5 text-gray-500 group-hover:text-[#8b0000] shrink-0 transition-colors" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-[#8b0000] transition-colors">Academic Metrics (v1)</p>
                <p className="text-xs text-gray-400 truncate">Original COSC425 research metrics project</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#8b0000] shrink-0 ml-auto transition-colors" />
            </a>
            {docsUrl && (
              <a href={docsUrl} target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#8b0000]/30 hover:shadow-sm transition-all bg-white">
                <Globe className="w-5 h-5 text-gray-500 group-hover:text-[#8b0000] shrink-0 transition-colors" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-[#8b0000] transition-colors">Documentation Site</p>
                  <p className="text-xs text-gray-400 truncate">{docsUrl}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#8b0000] shrink-0 ml-auto transition-colors" />
              </a>
            )}
            {apiDocsUrl && (
              <a href={apiDocsUrl} target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#8b0000]/30 hover:shadow-sm transition-all bg-white">
                <Code2 className="w-5 h-5 text-gray-500 group-hover:text-[#8b0000] shrink-0 transition-colors" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-[#8b0000] transition-colors">API Documentation</p>
                  <p className="text-xs text-gray-400 truncate">{apiDocsUrl}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#8b0000] shrink-0 ml-auto transition-colors" />
              </a>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Links are managed in the admin{" "}
            <button onClick={() => onNavigate("/admin-login")} className="hover:underline hover:text-[#8b0000] transition-colors">Contact Page Editor</button>.
          </p>
        </section>

        {/* Doc cards — managed from admin */}
        {docLinks.length > 0 && (
          <section className="max-w-4xl mx-auto px-6 py-12">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Documentation</h2>
            <div className="grid gap-5">
              {docLinks.map((doc, i) => (
                <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                  className="group flex items-start gap-5 p-6 rounded-xl border border-gray-200 hover:border-[#8b0000]/30 hover:shadow-sm transition-all bg-white">
                  <div className="w-10 h-10 rounded-lg bg-[#8b0000]/8 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#8b0000]/15 transition-colors">
                    <FileText className="w-5 h-5 text-[#8b0000]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#8b0000] transition-colors">{doc.title}</h3>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#8b0000] transition-colors shrink-0" />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{doc.description}</p>
                    <p className="text-xs text-gray-400 mt-2 font-mono truncate">{doc.url}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {docLinks.length === 0 && (
          <section className="max-w-4xl mx-auto px-6 py-12 text-center">
            <p className="text-sm text-gray-400">
              No documentation cards configured yet.{" "}
              <button onClick={() => onNavigate("/admin-login")} className="text-[#8b0000] hover:underline">
                Add them in the admin Contact Page Editor.
              </button>
            </p>
          </section>
        )}
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
