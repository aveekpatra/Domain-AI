import React from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "./ui/Container";
import ThemeToggle from "./ThemeToggle";

const NavbarLight: React.FC = () => {
  return (
    <header className="w-full bg-transparent">
      <Container>
        <nav className="flex h-16 items-center justify-between bg-transparent">
          <div className="flex items-center gap-3">
            <Image src="/convex.svg" alt="DomainMonster" width={28} height={28} className="opacity-80" />
            <Link href="/" className="font-semibold tracking-tight text-[17px] text-slate-900">
              DomainMonster
            </Link>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="font-semibold text-slate-900/90 hover:text-slate-900">Features</Link>
              <Link href="#pricing" className="font-semibold text-slate-900/90 hover:text-slate-900">Pricing</Link>
              <Link href="#faq" className="font-semibold text-slate-900/90 hover:text-slate-900">FAQ</Link>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="font-semibold text-slate-900/90 hover:text-slate-900">GitHub</a>
            </div>
            <ThemeToggle />
          </div>
        </nav>
      </Container>
    </header>
  );
};

export default NavbarLight;
