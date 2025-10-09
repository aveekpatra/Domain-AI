"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "./ui/Container";
import ThemeToggle from "./ThemeToggle";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const NavbarLight: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="w-full bg-transparent">
      <Container>
        <nav className="flex h-16 items-center justify-between bg-transparent">
          <div className="flex items-center gap-3">
            <Image
              src="/main-img.png"
              alt="Renko"
              width={40}
              height={40}
              className=""
            />
            <Link
              href="/"
              className="font-semibold tracking-tight text-[17px] text-slate-900 [html[data-theme='dark']_&]:text-slate-100"
            >
              Renko
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="#features"
                className="font-semibold text-slate-900/90 hover:text-slate-900 [html[data-theme='dark']_&]:text-slate-100/90 [html[data-theme='dark']_&]:hover:text-slate-100"
              >
                Features
              </Link>
              <Link
                href="#changelogs"
                className="font-semibold text-slate-900/90 hover:text-slate-900 [html[data-theme='dark']_&]:text-slate-100/90 [html[data-theme='dark']_&]:hover:text-slate-100"
              >
                Changelogs
              </Link>
              <Link
                href="#faq"
                className="font-semibold text-slate-900/90 hover:text-slate-900 [html[data-theme='dark']_&]:text-slate-100/90 [html[data-theme='dark']_&]:hover:text-slate-100"
              >
                FAQ
              </Link>
              <Link
                href="#contact"
                className="font-semibold text-slate-900/90 hover:text-slate-900 [html[data-theme='dark']_&]:text-slate-100/90 [html[data-theme='dark']_&]:hover:text-slate-100"
              >
                Contact
              </Link>
            </div>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-900 hover:bg-slate-100 [html[data-theme='dark']_&]:text-slate-100 [html[data-theme='dark']_&]:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 [html[data-theme='dark']_&]:border-slate-700">
            <div className="flex flex-col space-y-3">
              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 font-semibold text-slate-900/90 hover:text-slate-900 hover:bg-slate-100 rounded-lg [html[data-theme='dark']_&]:text-slate-100/90 [html[data-theme='dark']_&]:hover:text-slate-100 [html[data-theme='dark']_&]:hover:bg-slate-800"
              >
                Features
              </Link>
              <Link
                href="#changelogs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 font-semibold text-slate-900/90 hover:text-slate-900 hover:bg-slate-100 rounded-lg [html[data-theme='dark']_&]:text-slate-100/90 [html[data-theme='dark']_&]:hover:text-slate-100 [html[data-theme='dark']_&]:hover:bg-slate-800"
              >
                Changelogs
              </Link>
              <Link
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 font-semibold text-slate-900/90 hover:text-slate-900 hover:bg-slate-100 rounded-lg [html[data-theme='dark']_&]:text-slate-100/90 [html[data-theme='dark']_&]:hover:text-slate-100 [html[data-theme='dark']_&]:hover:bg-slate-800"
              >
                FAQ
              </Link>
              <Link
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 font-semibold text-slate-900/90 hover:text-slate-900 hover:bg-slate-100 rounded-lg [html[data-theme='dark']_&]:text-slate-100/90 [html[data-theme='dark']_&]:hover:text-slate-100 [html[data-theme='dark']_&]:hover:bg-slate-800"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
};

export default NavbarLight;
