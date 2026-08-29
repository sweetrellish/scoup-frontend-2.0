import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface Props {
  onNavigate: (path: string) => void;
}

export function PrivacyPolicy({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar onNavigate={onNavigate} currentPath="/privacy" />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-light text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-12">
          Effective date: September 1, 2025 &nbsp;·&nbsp; Salisbury University — SCOUP Platform
        </p>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">1. About This Policy</h3>
            <p>
              SCOUP (Salisbury Collaborative Open University Platform) is a research discovery platform
              operated by Salisbury University. This policy explains what information we collect, how
              we use it, and your rights regarding that information.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">2. Information We Collect</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><span className="font-medium">Faculty account data</span> — name, institutional email address, username, department, and password (stored as a secure hash). Faculty may also voluntarily provide a photo, biography, research interests, qualifications, phone number, office location, and personal website.</li>
              <li><span className="font-medium">Research content</span> — publications, patents, and project information that faculty upload or link to their profiles.</li>
              <li><span className="font-medium">Collaboration inquiries</span> — name, email, institution, and message submitted by anyone who sends a collaboration request through the platform.</li>
              <li><span className="font-medium">Support tickets</span> — name, email, and message content submitted via the support form. Anonymous submissions include only the name and email provided.</li>
              <li><span className="font-medium">Usage data</span> — search queries and general platform usage patterns used to improve the service. No personally identifiable usage data is sold or shared with third parties.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">3. How We Use Your Information</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To display faculty research profiles in public search results (only for faculty who have enabled profile visibility).</li>
              <li>To facilitate collaboration inquiries between external parties and faculty members.</li>
              <li>To send account-related emails — password resets, institutional email verification, and approval notifications.</li>
              <li>To respond to support tickets submitted through the platform.</li>
              <li>To generate AI-assisted content (keywords, biography drafts) based on a faculty member's existing publications. This processing is performed via the OpenAI API.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">4. Information Sharing</h3>
            <p>
              We do not sell personal information. Faculty profile data that is set to public visibility
              is accessible to anyone who visits the SCOUP platform. Collaboration inquiry details are
              shared only with the faculty member the inquiry is addressed to and platform administrators.
              Support ticket content is accessible to platform administrators only.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">5. Data Retention</h3>
            <p>
              Faculty account data is retained for as long as the account is active. Faculty may request
              deletion of their account and associated data by contacting the platform administrators.
              Collaboration inquiries and support tickets are retained for administrative recordkeeping
              purposes.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">6. Security</h3>
            <p>
              Passwords are stored using industry-standard hashing and are never stored in plain text.
              Communication between your browser and the platform is encrypted via HTTPS. Access to
              administrative functions is restricted to authorized Salisbury University staff accounts.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">7. Your Rights</h3>
            <p>
              Faculty members may update or remove their profile information at any time through the
              faculty dashboard. You may also contact the SCOUP team to request access to, correction
              of, or deletion of your personal information.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">8. Contact</h3>
            <p>
              For privacy-related questions, contact the SCOUP team via the{" "}
              <button
                onClick={() => onNavigate("/contact")}
                className="text-[#8b0000] hover:underline"
              >
                Contact page
              </button>
              .
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-400">
          <button onClick={() => onNavigate("/terms")} className="hover:text-[#8b0000] hover:underline transition-colors">Terms of Service</button>
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
