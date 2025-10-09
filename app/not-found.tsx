import React from "react";
import Image from "next/image";
import Link from "next/link";
import NavbarLight from "@/components/NavbarLight";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 [html[data-theme='dark']_&]:bg-slate-950 [html[data-theme='dark']_&]:text-slate-50">
      <NavbarLight />
      
      <main className="flex-1">
        <Container className="pt-16 pb-20 px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="flex justify-center mb-8">
              <Image
                src="/not-found.png"
                alt="Page not found"
                width={200}
                height={200}
                className="opacity-80"
                priority
              />
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 [html[data-theme='dark']_&]:text-slate-100 mb-4">
              Page Not Found
            </h1>
            
            <p className="text-lg text-slate-600 [html[data-theme='dark']_&]:text-slate-400 mb-8">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. 
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 transition-colors [html[data-theme='dark']_&]:bg-slate-100 [html[data-theme='dark']_&]:text-slate-900 [html[data-theme='dark']_&]:hover:bg-slate-200"
              >
                Go Home
              </Link>
              
              <Link
                href="/search"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 transition-colors [html[data-theme='dark']_&]:border-slate-700 [html[data-theme='dark']_&]:bg-slate-800 [html[data-theme='dark']_&]:text-slate-100 [html[data-theme='dark']_&]:hover:bg-slate-700"
              >
                Search Domains
              </Link>
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-200 [html[data-theme='dark']_&]:border-slate-700">
              <h2 className="text-lg font-medium text-slate-900 [html[data-theme='dark']_&]:text-slate-100 mb-4">
                Popular Pages
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-4 text-sm justify-center">
                <Link
                  href="/#features"
                  className="text-slate-600 hover:text-slate-900 [html[data-theme='dark']_&]:text-slate-400 [html[data-theme='dark']_&]:hover:text-slate-100 transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="/#changelogs"
                  className="text-slate-600 hover:text-slate-900 [html[data-theme='dark']_&]:text-slate-400 [html[data-theme='dark']_&]:hover:text-slate-100 transition-colors"
                >
                  Changelogs
                </Link>
                <Link
                  href="/#faq"
                  className="text-slate-600 hover:text-slate-900 [html[data-theme='dark']_&]:text-slate-400 [html[data-theme='dark']_&]:hover:text-slate-100 transition-colors"
                >
                  FAQ
                </Link>
                <Link
                  href="/#contact"
                  className="text-slate-600 hover:text-slate-900 [html[data-theme='dark']_&]:text-slate-400 [html[data-theme='dark']_&]:hover:text-slate-100 transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </main>
      
      <Footer />
    </div>
  );
}