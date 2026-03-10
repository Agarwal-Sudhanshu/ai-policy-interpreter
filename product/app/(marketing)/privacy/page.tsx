import Link from "next/link";

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-slate-900 to-blue-900 py-16 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-slate-200">
            How we collect, use, and protect your information.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="prose prose-slate mx-auto max-w-3xl px-6 leading-relaxed">
          <p className="text-sm font-medium text-slate-500">
            Effective Date: June 2026
          </p>
          <p className="mt-4 text-slate-700">
            PolicyCopilot (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) provides
            AI-powered tools to help understand credit policies and evaluate
            loan eligibility. This Privacy Policy explains how we collect, use,
            and protect information when you use our website and services.
          </p>

          <div className="mt-10 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Information We Collect
              </h2>
              <p className="mt-3 text-slate-700">
                We may collect the following information when you use our
                services:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-700">
                <li>Account information such as name and email address</li>
                <li>
                  Usage information including pages visited and features used
                </li>
                <li>Policy documents or inputs submitted to the system</li>
                <li>
                  Technical data such as browser type, device type, and IP
                  address
                </li>
              </ul>
              <p className="mt-3 text-slate-700">
                This information helps us improve the reliability and
                performance of the platform.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                How We Use Information
              </h2>
              <p className="mt-3 text-slate-700">
                We use collected information to:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-700">
                <li>Provide and improve the PolicyCopilot service</li>
                <li>Process user requests and AI queries</li>
                <li>Analyze product usage and performance</li>
                <li>Maintain security and prevent abuse</li>
              </ul>
              <p className="mt-3 text-slate-700">
                We do not sell personal information to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Data Security
              </h2>
              <p className="mt-3 text-slate-700">
                We implement reasonable technical and organizational
                safeguards to protect user data from unauthorized access,
                disclosure, or misuse.
              </p>
              <p className="mt-3 text-slate-700">
                However, no system can guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Third-Party Services
              </h2>
              <p className="mt-3 text-slate-700">
                Our platform may rely on third-party infrastructure providers
                or analytics tools. These providers may process limited
                technical information necessary to deliver the service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Cookies
              </h2>
              <p className="mt-3 text-slate-700">
                We may use cookies or similar technologies to:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-700">
                <li>Maintain session functionality</li>
                <li>Improve website performance</li>
                <li>Understand usage patterns</li>
              </ul>
              <p className="mt-3 text-slate-700">
                Users can manage cookie preferences through their browser
                settings.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Changes to This Policy
              </h2>
              <p className="mt-3 text-slate-700">
                We may update this Privacy Policy periodically. Updated
                versions will be posted on this page with a revised effective
                date.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Contact
              </h2>
              <p className="mt-3 text-slate-700">
                For questions regarding this policy, contact:
              </p>
              <p className="mt-2">
                <Link
                  href="mailto:support@policycopilot.ai"
                  className="font-medium text-blue-600 hover:underline"
                >
                  support@policycopilot.ai
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
