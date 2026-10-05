import { Link } from "react-router-dom";
import SEO from "../../components/seo/SEO";

export default function Terms() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
      <SEO
        title="Terms of Service"
        path="/terms"
        description="TaleMine's Terms of Service — the rules for using our platform."
      />

      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold">Terms of Service</h1>

        <p className="mt-2 text-sm text-gray-500">
          Last updated: October 2026
        </p>

        <div className="mt-10 space-y-8 text-gray-300">
          <section>
            <p>
              Welcome to TaleMine. By accessing or using talemine.com (the
              "Service"), you agree to these Terms of Service ("Terms"). If
              you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              1. Using TaleMine
            </h2>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                You must provide accurate information when creating an
                account.
              </li>
              <li>
                You are responsible for keeping your account credentials
                secure.
              </li>
              <li>
                You must not use the Service for any unlawful purpose or in
                a way that could harm TaleMine or other users.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              2. Content You Submit
            </h2>

            <p className="mt-3">
              If you publish stories, chapters, comments, or other content
              ("User Content") on TaleMine:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                You retain ownership of your original work. By publishing
                on TaleMine, you grant us a non-exclusive, worldwide
                license to host, display, and distribute that content on
                the Service.
              </li>
              <li>
                You confirm that your content is your own original work, or
                that you have the rights to publish it, and that it does
                not infringe on the rights of any third party.
              </li>
              <li>
                You must not submit content that is illegal, defamatory,
                hateful, sexually explicit, or that infringes on anyone's
                intellectual property or privacy rights.
              </li>
              <li>
                We reserve the right to remove any content that violates
                these Terms, without prior notice.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              3. Content on TaleMine
            </h2>

            <p className="mt-3">
              All TaleMine branding, design, and site functionality (apart
              from User Content) is owned by TaleMine. You may not copy,
              reproduce, or redistribute the Service itself without
              permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              4. Advertising
            </h2>

            <p className="mt-3">
              TaleMine may display advertisements, including through Google
              AdSense, to support the operation of the Service. See our{" "}
              <Link
                to="/privacy-policy"
                className="text-cyan-400 hover:text-cyan-300"
              >
                Privacy Policy
              </Link>{" "}
              for details on how advertising partners may use cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              5. Termination
            </h2>

            <p className="mt-3">
              We may suspend or terminate your account if you violate these
              Terms. You may stop using the Service and request deletion of
              your account at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              6. Disclaimer and Limitation of Liability
            </h2>

            <p className="mt-3">
              The Service is provided "as is" without warranties of any
              kind. TaleMine is not liable for any indirect, incidental, or
              consequential damages arising from your use of the Service,
              to the fullest extent permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              7. Changes to These Terms
            </h2>

            <p className="mt-3">
              We may update these Terms from time to time. Continued use of
              the Service after changes are posted means you accept the
              updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              8. Contact Us
            </h2>

            <p className="mt-3">
              Questions about these Terms? Contact us at{" "}
              <a
                href="mailto:contact@talemine.com"
                className="text-cyan-400 hover:text-cyan-300"
              >
                contact@talemine.com
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
