import NavbarLight from "@/components/NavbarLight";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";

export const metadata = {
  title: "Terms & Conditions — Renko",
  description: "Terms and Conditions for Renko AI Domain Name Finder",
};

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-page-bg text-page-text">
      <NavbarLight />
      <main className="relative z-10">
        <Container className="px-4 py-16 flex justify-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-2 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
              Terms & Conditions
            </h1>
            <p className="text-slate-600 [html[data-theme='dark']_&]:text-slate-400 mb-8">
              Last updated: {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <div className="prose prose-slate [html[data-theme='dark']_&]:prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  1. Acceptance of Terms
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  By accessing and using Renko (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  2. Use License
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  Permission is granted to temporarily download one copy of the materials (information or software) on Renko for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-slate-700 [html[data-theme='dark']_&]:text-slate-300 space-y-2 mt-3">
                  <li>Modifying or copying the materials</li>
                  <li>Using the materials for any commercial purpose or for any public display</li>
                  <li>Attempting to decompile or reverse engineer any software contained on the Service</li>
                  <li>Removing any copyright or other proprietary notations from the materials</li>
                  <li>Transferring the materials to another person or &quot;mirroring&quot; the materials on any other server</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  3. Disclaimer
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  The materials on Renko are provided on an &quot;as is&quot; basis. Renko makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  4. Limitations
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  In no event shall Renko or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Renko, even if Renko or an authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  5. Accuracy of Materials
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  The materials appearing on Renko could include technical, typographical, or photographic errors. Renko does not warrant that any of the materials on the Service are accurate, complete, or current. Renko may make changes to the materials contained on the Service at any time without notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  6. Links
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  Renko has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Renko of the site. Use of any such linked website is at the user&apos;s own risk.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  7. Modifications
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  Renko may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  8. Governing Law
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Renko operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  9. Contact
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  If you have any questions about these Terms & Conditions, please contact us via the contact form on our website.
                </p>
              </section>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
