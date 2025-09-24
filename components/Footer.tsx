import React from "react";
import Container from "./ui/Container";

const Footer: React.FC = () => {
  return (
    <footer className="relative py-10">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-slate-600 sm:flex-row">
          <p className="order-2 sm:order-1">© {new Date().getFullYear()} DomainMonster. All rights reserved.</p>
          <div className="order-1 sm:order-2 flex items-center gap-4">
            <a href="#privacy" className="hover:text-slate-900">Privacy</a>
            <a href="#terms" className="hover:text-slate-900">Terms</a>
            <a href="#contact" className="hover:text-slate-900">Contact</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
