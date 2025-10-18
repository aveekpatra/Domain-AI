import React from "react";
import Link from "next/link";
import Container from "./ui/Container";

const Footer: React.FC = () => {
  return (
    <footer className="relative py-8 sm:py-10 border-t border-slate-200 [html[data-theme='dark']_&]:border-slate-700">
      <Container className="px-4">
        <div className="flex flex-col items-center justify-between gap-4 text-xs sm:text-sm text-slate-600 sm:flex-row [html[data-theme='dark']_&]:text-slate-400">
          <p className="order-2 sm:order-1">
            © {new Date().getFullYear()} Renko. All rights reserved.
          </p>
          <div className="order-1 sm:order-2 flex items-center gap-4">
            <Link
              href="/privacy"
              className="hover:text-slate-900 [html[data-theme='dark']_&]:hover:text-slate-100"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-slate-900 [html[data-theme='dark']_&]:hover:text-slate-100"
            >
              Terms
            </Link>
            <Link
              href="/#contact"
              className="hover:text-slate-900 [html[data-theme='dark']_&]:hover:text-slate-100"
            >
              Contact
            </Link>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-200/50 [html[data-theme='dark']_&]:border-slate-700/50">
          <p className="text-center text-xs text-slate-500 [html[data-theme='dark']_&]:text-slate-500">
            Made with <span className="text-red-500 animate-pulse">❤️</span> by{" "}
            <a
              href="https://github.com/aveekpatra"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-700 hover:text-slate-900 transition-colors [html[data-theme='dark']_&]:text-slate-300 [html[data-theme='dark']_&]:hover:text-slate-100"
            >
              Aveek Patra
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
