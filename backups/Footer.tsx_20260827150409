interface FooterProps {
  onNavigate: (path: string) => void;
  githubUrl?: string;
}

export function Footer({ onNavigate, githubUrl }: FooterProps) {
  return (
    <footer className="bg-[#f5f5dc] border-t border-[#e5e5c5] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Branding */}
          <div>
            <span className="text-xl font-bold text-gray-900 mb-4 block">SCOUP</span>
            <p className="text-sm text-gray-600 leading-relaxed">
              Salisbury University's centralized knowledge and collaboration platform.
              Connecting internal expertise with external opportunities to drive innovation.
            </p>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">About</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => onNavigate("/about")}
                  className="text-gray-600 hover:text-[#8b0000] transition-colors text-sm"
                >
                  SCOUP Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("/docs")}
                  className="text-gray-600 hover:text-[#8b0000] transition-colors text-sm"
                >
                  Documentation
                </button>
              </li>
              {githubUrl && (
                <li>
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#8b0000] transition-colors text-sm"
                  >
                    GitHub
                  </a>
                </li>
              )}
              <li>
                <button
                  onClick={() => onNavigate("/contact")}
                  className="text-gray-600 hover:text-[#8b0000] transition-colors text-sm"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("/admin-login")}
                  className="text-gray-600 hover:text-[#8b0000] transition-colors text-sm"
                >
                  Admin
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 mt-8 border-t border-[#e5e5c5]">
          <p className="text-sm text-gray-600">© 2025 SCOUP Team. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <button
              onClick={() => onNavigate("/privacy")}
              className="text-sm text-gray-600 hover:text-[#8b0000] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate("/terms")}
              className="text-sm text-gray-600 hover:text-[#8b0000] transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onNavigate("/cookie-policy")}
              className="text-sm text-gray-600 hover:text-[#8b0000] transition-colors"
            >
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
