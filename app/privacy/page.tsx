import NavbarLight from "@/components/NavbarLight";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";

export const metadata = {
  title: "Privacy Policy — Renko",
  description: "Privacy Policy for Renko AI Domain Name Finder",
};

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-page-bg text-page-text">
      <NavbarLight />
      <main className="relative z-10">
        <Container className="px-4 py-16 flex justify-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-2 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
              Privacy Policy
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
                  Introduction
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  Renko (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or &quot;Company&quot;) operates the Renko website and service. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  1. Information Collection and Use
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  We collect several different types of information for various purposes to provide and improve our Service to you.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  Types of Data Collected:
                </h3>
                <ul className="list-disc list-inside text-slate-700 [html[data-theme='dark']_&]:text-slate-300 space-y-2">
                  <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you (&quot;Personal Data&quot;). This may include, but is not limited to:
                    <ul className="list-circle list-inside ml-4 mt-2 space-y-1">
                      <li>Email address</li>
                      <li>First name and last name</li>
                      <li>Cookies and Usage Data</li>
                    </ul>
                  </li>
                  <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used (&quot;Usage Data&quot;). This may include information such as your computer&apos;s Internet Protocol address (e.g. IP address), browser type, browser version, the pages you visit, the time and date of your visit, and other diagnostic data.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  2. Use of Data
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  Renko uses the collected data for various purposes:
                </p>
                <ul className="list-disc list-inside text-slate-700 [html[data-theme='dark']_&]:text-slate-300 space-y-2 mt-3">
                  <li>To provide and maintain our Service</li>
                  <li>To notify you about changes to our Service</li>
                  <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                  <li>To provide customer support</li>
                  <li>To gather analysis or valuable information so that we can improve our Service</li>
                  <li>To monitor the usage of our Service</li>
                  <li>To detect, prevent and address technical issues</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  3. Security of Data
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  4. Changes to This Privacy Policy
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date at the top of this Privacy Policy.
                </p>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed mt-3">
                  You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  5. Contact Us
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us via the contact form on our website or reach out to us directly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  6. Third-Party Links
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  Our Service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party&apos;s site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  7. Cookies
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  Our Service uses cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 [html[data-theme='dark']_&]:text-slate-100">
                  8. Your Rights
                </h2>
                <p className="text-slate-700 [html[data-theme='dark']_&]:text-slate-300 leading-relaxed">
                  You have the right to access, update, or delete the information we have on you. If you wish to exercise these rights, please contact us. We will respond to your request within a reasonable timeframe.
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
