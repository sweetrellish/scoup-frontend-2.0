import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface Props {
  onNavigate: (path: string) => void;
}

export function TermsOfService({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar onNavigate={onNavigate} currentPath="/terms" />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-light text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-12">
          Effective date: September 1, 2025 &nbsp;·&nbsp; Salisbury University — SCOUP Platform
        </p>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">1. Acceptance</h3>
            <p>
              By accessing or using SCOUP, you agree to these terms. If you do not agree, please do
              not use the platform.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">2. Eligibility</h3>
            <p>
              Faculty accounts are available to current or affiliated Salisbury University faculty members.
              Account creation is subject to administrator approval. The public search and browse features
              are available to anyone without registration.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">3. Acceptable Use</h3>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>Submit false, misleading, or unauthorized information to the platform.</li>
              <li>Use the platform to send unsolicited messages or spam.</li>
              <li>Attempt to gain unauthorized access to accounts, systems, or data.</li>
              <li>Scrape or systematically harvest content from the platform without permission.</li>
              <li>Use the platform for any purpose that violates applicable law.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">4. Faculty Content</h3>
            <p>
              Faculty members are responsible for the accuracy of the information they submit. By
              uploading content (publications, project descriptions, photos, etc.), you confirm that
              you have the right to share that content and grant SCOUP permission to display it on
              the platform.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">5. Collaboration Inquiries</h3>
            <p>
              SCOUP provides a channel for submitting collaboration inquiries to faculty members.
              Submitting an inquiry does not create any contractual obligation on either party.
              SCOUP is not responsible for the outcome of any communication facilitated through
              the platform.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">6. Intellectual Property</h3>
            <p>
              The SCOUP platform, including its design, code, and branding, is the property of
              Salisbury University. Faculty retain ownership of their research content. SCOUP is
              granted a limited, non-exclusive license to display that content on the platform for
              the purpose of facilitating research discovery and collaboration.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">7. Availability</h3>
            <p>
              SCOUP is provided on an as-is basis. We do not guarantee uninterrupted access and
              reserve the right to modify, suspend, or discontinue the platform at any time.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">8. Limitation of Liability</h3>
            <p>
              To the extent permitted by law, Salisbury University and the SCOUP team are not liable
              for any direct, indirect, incidental, or consequential damages arising from your use of
              the platform or its content.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">9. Changes to These Terms</h3>
            <p>
              We may update these terms from time to time. Continued use of the platform after
              changes are posted constitutes acceptance of the revised terms.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-400">
          <button onClick={() => onNavigate("/privacy")} className="hover:text-[#8b0000] hover:underline transition-colors">Privacy Policy</button>
          <span>·</span>
          <button onClick={() => onNavigate("/cookie-policy")} className="hover:text-[#8b0000] hover:underline transition-colors">Cookie Policy</button>
          <span>·</span>
          <button onClick={() => onNavigate("/contact")} className="hover:text-[#8b0000] hover:underline transition-colors">Contact</button>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
