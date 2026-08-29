import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface Props {
  onNavigate: (path: string) => void;
}

export function CookiePolicy({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar onNavigate={onNavigate} currentPath="/cookie-policy" />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-light text-gray-900 mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-400 mb-12">
          Effective date: September 1, 2025 &nbsp;·&nbsp; Salisbury University — SCOUP Platform
        </p>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">1. What Are Cookies</h3>
            <p>
              Cookies are small text files placed on your device by a website when you visit it. They
              are widely used to make websites work, improve performance, and provide information to
              the site owners.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">2. How SCOUP Uses Cookies</h3>
            <p>
              SCOUP uses a minimal set of storage mechanisms to operate the platform. We do not use
              advertising cookies or third-party tracking cookies.
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>
                <span className="font-medium">Session storage</span> — used to keep you logged in
                during your current browser session. This data is cleared automatically when you
                close the browser tab or window.
              </li>
              <li>
                <span className="font-medium">Local storage</span> — used to store authentication
                tokens that allow secure access to your faculty or admin account. These are cleared
                when you log out.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">3. Third-Party Services</h3>
            <p>
              SCOUP is hosted on Render. Render may use standard web server logs and infrastructure
              cookies as part of providing the hosting service. These are outside of SCOUP's direct
              control. Please refer to{" "}
              <a
                href="https://render.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8b0000] hover:underline"
              >
                Render's Privacy Policy
              </a>{" "}
              for details.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">4. Your Choices</h3>
            <p>
              Most browsers allow you to control cookies and local storage through their settings.
              Please note that disabling storage entirely may prevent you from logging into the
              platform or using certain features. You can log out of SCOUP at any time to clear
              your session and authentication tokens.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">5. Changes to This Policy</h3>
            <p>
              We may update this Cookie Policy from time to time. Any changes will be posted on
              this page with an updated effective date.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">6. Contact</h3>
            <p>
              If you have questions about how SCOUP uses cookies or storage, please reach out via
              the{" "}
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
          <button onClick={() => onNavigate("/privacy")} className="hover:text-[#8b0000] hover:underline transition-colors">Privacy Policy</button>
          <span>·</span>
          <button onClick={() => onNavigate("/terms")} className="hover:text-[#8b0000] hover:underline transition-colors">Terms of Service</button>
          <span>·</span>
          <button onClick={() => onNavigate("/contact")} className="hover:text-[#8b0000] hover:underline transition-colors">Contact</button>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
