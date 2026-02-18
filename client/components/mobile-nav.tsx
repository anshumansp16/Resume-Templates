"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden inline-flex items-center justify-center rounded-lg p-2.5 text-foreground hover:bg-white/[0.08] transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
            onClick={closeMenu}
          />

          {/* Menu Panel */}
          <div className="fixed top-16 left-0 right-0 bg-background border-b border-border shadow-2xl z-50 md:hidden animate-in slide-in-from-top">
            <nav className="px-6 py-6 space-y-4">
              <Link
                href="#features"
                onClick={closeMenu}
                className="block px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-white/[0.08] transition-colors"
              >
                Features
              </Link>
              <Link
                href="#templates"
                onClick={closeMenu}
                className="block px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-white/[0.08] transition-colors"
              >
                Templates
              </Link>
              <div className="pt-4 border-t border-border space-y-3">
                <Link
                  href="#templates"
                  onClick={closeMenu}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-foreground-muted hover:text-foreground hover:bg-white/[0.08] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="#templates"
                  onClick={closeMenu}
                  className="block px-4 py-3 rounded-lg text-base font-semibold text-center bg-primary text-white hover:bg-primary-electric transition-all"
                >
                  Get Started Free
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
