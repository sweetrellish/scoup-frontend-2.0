import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import salisburyLogo from "../assets/images/Salisbury_University_logo.png";

interface NavbarProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export function Navbar({ onNavigate, currentPath }: NavbarProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Mobile menu checkbox - hidden but controls the menu */}
        <input type="checkbox" id="mobile-menu" className="peer hidden" />

        <div className="flex items-center justify-between gap-4">
          {/* Logo - Takes equal space as right side */}
          <div className="flex-1 flex justify-start">
            <a
              href="https://www.salisbury.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <img
                src={salisburyLogo}
                alt="Salisbury University"
                className="h-10"
              />
            </a>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex flex-1 justify-center gap-8">
            <button
              onClick={() => onNavigate("/")}
              className={`transition-colors font-medium ${
                currentPath === "/"
                  ? "text-[#8b0000] font-semibold"
                  : "text-gray-700 hover:text-[#8b0000]"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate("/browse")}
              className={`transition-colors font-medium ${
                currentPath.startsWith("/browse")
                  ? "text-[#8b0000] font-semibold"
                  : "text-gray-700 hover:text-[#8b0000]"
              }`}
            >
              Browse
            </button>
            <button
              onClick={() => onNavigate("/about")}
              className={`transition-colors font-medium ${
                currentPath === "/about"
                  ? "text-[#8b0000] font-semibold"
                  : "text-gray-700 hover:text-[#8b0000]"
              }`}
            >
              About SCOUP
            </button>
            <button
              onClick={() => onNavigate("/docs")}
              className={`transition-colors font-medium ${
                currentPath === "/docs"
                  ? "text-[#8b0000] font-semibold"
                  : "text-gray-700 hover:text-[#8b0000]"
              }`}
            >
              Docs
            </button>
          </nav>

          {/* Right Side - Desktop Buttons - Takes equal space as left side */}
          <div className="hidden md:flex flex-1 items-center justify-end gap-3">
            <Button
              onClick={() => onNavigate("/faculty-login")}
              className="bg-[#8b0000] hover:bg-[#700000] text-white font-medium transition-colors"
            >
              Faculty Login
            </Button>
          </div>

          {/* Mobile Menu Toggle - Only visible on mobile */}
          <label htmlFor="mobile-menu" className="md:hidden cursor-pointer">
            <Menu className="w-6 h-6 text-gray-700 peer-checked:hidden" />
            <X className="w-6 h-6 text-gray-700 hidden peer-checked:block" />
          </label>
        </div>

        {/* Mobile Navigation - Controlled by checkbox */}
        <div className="md:hidden hidden peer-checked:block mt-4 pt-4 border-t border-gray-200 space-y-3">
          <button
            onClick={() => onNavigate("/browse")}
            className="block text-gray-700 hover:text-[#8b0000] transition-colors w-full text-left"
          >
            Browse
          </button>
          <button
            onClick={() => onNavigate("/about")}
            className="block text-gray-700 hover:text-[#8b0000] transition-colors w-full text-left"
          >
            About SCOUP
          </button>
          <Button
            onClick={() => onNavigate("/faculty-login")}
            variant="ghost"
            className="text-gray-900 hover:bg-[#ffd100] hover:text-[#8b0000] font-medium w-full"
          >
            Faculty Login
          </Button>
        </div>
      </div>
    </header>
  );
}
