import React from "react";
import Container from "./ui/Container";

const Footer: React.FC = () => {
  return (
    <footer className="relative py-8 sm:py-10">
      <Container className="px-4">
        <div className="flex flex-col items-center justify-between gap-4 text-xs sm:text-sm text-slate-600 sm:flex-row [html[data-theme='dark']_&]:text-slate-400">
          <p className="order-2 sm:order-1">
            © {new Date().getFullYear()} Renko. All rights reserved.
          </p>
          <div className="order-1 sm:order-2 flex items-center gap-4">
            <a
              href="#privacy"
              className="hover:text-slate-900 [html[data-theme='dark']_&]:hover:text-slate-100"
            >
              Privacy
            </a>
            <a
              href="#terms"
              className="hover:text-slate-900 [html[data-theme='dark']_&]:hover:text-slate-100"
            >
              Terms
            </a>
            <a
              href="#contact"
              className="hover:text-slate-900 [html[data-theme='dark']_&]:hover:text-slate-100"
            >
              Contact
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
