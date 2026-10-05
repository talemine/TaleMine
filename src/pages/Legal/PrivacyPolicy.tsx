import { Link } from "react-router-dom";
import SEO from "../../components/seo/SEO";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <SEO
        title="Privacy Policy"
        path="/privacy-policy"
        description="TaleMine's Privacy Policy — how we collect, use, and protect your information."
      />

      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>

        <p className="mt-2 text-sm text-gray-500">
          Last updated: October 2026
        </p>

        <div className="mt-10 space-y-8 text-gray-300">
          <section>
            <p>
              TaleMine ("we", "us", "our") operates the website
              talemine.com (the "Service"). This Privacy Policy explains
              what information we collect, how we use it, and the choices
              you have.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              1. Information We Collect
            </h2>

            <p className="mt-3">
              When you create an account, we collect:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Email address and password (used only for authentication)</li>
              <li>Username and display name</li>
              <li>Optional profile information: bio, avatar image</li>
              <li>
                Content you create: stories, chapters, comments, likes,
                bookmarks
              </li>
              <li>Reading progress and reading history</li>
              <li>Your preferred language setting</li>
            </ul>

            <p className="mt-3">
              We use Supabase as our backend and authentication provider.
              Your account data is stored securely in Supabase's
              infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              2. Cookies and Similar Technologies
            </h2>

            <p className="mt-3">
              TaleMine uses cookies and local storage to:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Keep you signed in between visits</li>
              <li>Remember your reading position and preferences</li>
            </ul>

            <p className="mt-3">
              If we enable <strong>Google Analytics</strong> on this site,
              it may use cookies to collect anonymized usage statistics
              (such as pages visited and time spent on the site) to help us
              understand and improve the Service.
            </p>

            <p className="mt-3">
              If this site is approved for and displays ads through{" "}
              <strong>Google AdSense</strong>, Google and its partners may
              use cookies to serve ads based on your prior visits to this
              site or other sites, and/or to measure ad performance.
              You can learn more about how Google uses data and manage your
              ad personalization settings at{" "}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noreferrer noopener"
                className="text-cyan-400 hover:text-cyan-300"
              >
                policies.google.com/technologies/ads
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              3. How We Use Your Information
            </h2>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>To provide and maintain the Service (account, reading, writing features)</li>
              <li>To personalize your experience (language, reading progress)</li>
              <li>To communicate with you (e.g. password reset emails)</li>
              <li>To understand usage and improve the Service</li>
              <li>To display advertising, where applicable</li>
            </ul>

            <p className="mt-3">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              4. Data Sharing
            </h2>

            <p className="mt-3">
              We share information only with the service providers that
              help us operate TaleMine, including:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Supabase (database, authentication, file storage)</li>
              <li>Cloudflare (hosting and content delivery)</li>
              <li>
                Google (Analytics and/or AdSense, where enabled)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              5. Your Choices
            </h2>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                You can review and update your profile information at any
                time from your{" "}
                <Link
                  to="/account"
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  Account
                </Link>{" "}
                page.
              </li>
              <li>
                You can request deletion of your account and associated
                data by contacting us (see below).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              6. Children's Privacy
            </h2>

            <p className="mt-3">
              TaleMine publishes content suitable for readers of all ages,
              including children's stories and rhymes. We do not knowingly
              collect personal information from children without
              appropriate parental involvement in account creation. If you
              believe a child has provided us with personal information
              without consent, please contact us so we can remove it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              7. Changes to This Policy
            </h2>

            <p className="mt-3">
              We may update this Privacy Policy from time to time. We will
              post any changes on this page with an updated "Last updated"
              date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              8. Contact Us
            </h2>

            <p className="mt-3">
              If you have questions about this Privacy Policy or your data,
              contact us at{" "}
              <a
                href="mailto:info.talemine@gmail.com"
                className="text-cyan-400 hover:text-cyan-300"
              >
                info.talemine@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          <Link to="/" className="transition hover:text-cyan-400">
            ← Back to TaleMine
          </Link>
        </p>
      </div>
    </main>
  );
}
