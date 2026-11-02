import { Link } from "react-router-dom";
import { Shield, ArrowLeft, RefreshCw, Globe, Clock, FileText, MonitorSmartphone } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm dark:text-white/70 text-slate-700 hover:text-white dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 dark:text-white/70 text-slate-500" />
          Back to home
        </Link>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-white/10 bg-slate-50 text-white/80 dark:text-white/80 text-slate-800 text-sm font-medium mb-4">
            <Shield className="w-4 h-4 dark:text-white/80 text-slate-600" />
            Privacy & Data Use
          </div>
          <h1 className="text-4xl font-bold dark:text-white text-slate-900 mb-3">Privacy Policy</h1>
          <p className="dark:text-white/60 text-slate-500 text-lg">
            Last updated: October 2026
          </p>
        </div>

        {/* Consent summary */}
        <section className="mb-10 p-5 rounded-2xl bg-[#4FD1C5]/5 border border-[#4FD1C5]/20">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#4FD1C5] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="dark:text-white text-slate-900 font-semibold mb-1">How this version uses cookies and analytics</h3>
              <p className="dark:text-white/70 text-slate-700 text-sm leading-relaxed">
                This site uses essential storage to save your progress and preferences.
                It also includes a non-essential analytics tool from Vercel, which is disabled until
                you choose to accept it. A consent banner appears at the bottom of the page the first
                time you visit.
              </p>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4">
            Who We Are
          </h2>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed">
            Digital Guardian Wellness is a digital-wellness and family-safety project. We build tools and
            learning experiences that help people understand screen time, online safety, privacy settings,
            and healthier digital habits.
          </p>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed mt-4">
            This policy explains what information we collect, how we use it, and what choices you have.
            If you are using this service on behalf of a child, please read the
            <span className="dark:text-white text-slate-900 font-medium"> Children & Families section</span> carefully.
          </p>
        </section>

        {/* What we collect */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4">
            What We Collect
          </h2>
          <div className="space-y-4">
            <div className="dark:bg-white/5 bg-slate-50 rounded-2xl p-5 dark:border-white/10 border-slate-200">
              <h3 className="dark:text-white text-slate-900 font-semibold mb-2">Information you provide directly</h3>
              <p className="dark:text-white/70 text-slate-700 leading-relaxed text-sm">
                When you create an account, join a family group, sign a commitment, or use a workshop or
                course feature, we may receive information you choose to give us, such as your name, email
                address, family group details, and the answers or notes you enter into our tools.
              </p>
            </div>

            <div className="dark:bg-white/5 bg-slate-50 rounded-2xl p-5 dark:border-white/10 border-slate-200">
              <h3 className="dark:text-white text-slate-900 font-semibold mb-2">Usage and progress information</h3>
              <p className="dark:text-white/70 text-slate-700 leading-relaxed text-sm">
                We may collect information about how you use the platform, including course progress,
                workshop completion status, and assessment results. Some of this information may be stored
                locally in your browser. Some may be sent to our backend if you use an online feature.
              </p>
            </div>

            <div className="dark:bg-white/5 bg-slate-50 rounded-2xl p-5 dark:border-white/10 border-slate-200">
              <h3 className="dark:text-white text-slate-900 font-semibold mb-2">Information from other sources</h3>
              <p className="dark:text-white/70 text-slate-700 leading-relaxed text-sm">
                If you use your account with other services that connect to this platform, we may receive
                limited information from those services as described in their terms and your choices.
              </p>
            </div>
          </div>
        </section>

        {/* How we use it */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4">
            How We Use Your Information
          </h2>
          <ul className="space-y-3">
            {[
              "Let you use the platform and save your progress",
              "Deliver courses, workshops, and assessments",
              "Support family features such as agreements and commitments",
              "Improve the platform and understand how people use it",
              "Communicate with you about your account or a family feature, when needed",
              "Meet legal or security obligations, where applicable",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 dark:text-white/70 text-slate-700">
                <span className="text-[#4FD1C5] mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="dark:text-white/60 text-slate-500 mt-4 text-sm">
            We do not sell your personal data for advertising purposes as part of this project.
          </p>
        </section>

        {/* Children & families */}
        <section className="mb-10 border-l-2 border-[#4FD1C5]/40 pl-6">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4 flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#4FD1C5]" />
            Children & Families
          </h2>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed">
            Digital Guardian is designed with families in mind, including younger users in some cases. We take
            that seriously.
          </p>
          <div className="mt-4 space-y-3 dark:text-white/70 text-slate-700 leading-relaxed">
            <p>
              If you are a parent or guardian, we encourage you to review the tools your child uses and to use
              family supervision features where they exist.
            </p>
            <p>
              Where a child is using the platform, we aim to collect only what is needed for the feature they
              are using, and we avoid unnecessary tracking.
            </p>
            <p>
              If our platform ever collects personal information from a child, we intend to handle it with
              higher privacy defaults and to make sure a parent or guardian can review or delete it where the
              law requires it.
            </p>
          </div>
        </section>

        {/* Storage & security */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4">
            Storage & Security
          </h2>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed">
            Some information may be stored in your browser using local storage or similar features. Other
            information may be stored on our servers when you use online features.
          </p>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed mt-4">
            We aim to keep data secure using reasonable safeguards, but no digital system can be guaranteed
            to be 100% secure. If you believe something is wrong, please contact us.
          </p>
          <div className="mt-6 space-y-4">
            <div className="dark:bg-white/5 bg-slate-50 rounded-2xl p-5 dark:border-white/10 border-slate-200">
              <h3 className="dark:text-white text-slate-900 font-semibold mb-2">Cloud Database (Neon Postgres)</h3>
              <p className="dark:text-white/70 text-slate-700 leading-relaxed text-sm">
                Family commitments, workshop progress, and assessment results are stored in a cloud-hosted
                PostgreSQL database (Neon). Sensitive fields including commitment terms and member names are
                encrypted before storage using AES-256-GCM. The encryption key is managed separately from
                the database.
              </p>
            </div>
            <div className="dark:bg-white/5 bg-slate-50 rounded-2xl p-5 dark:border-white/10 border-slate-200">
              <h3 className="dark:text-white text-slate-900 font-semibold mb-2">IPFS Metadata Pinning</h3>
              <p className="dark:text-white/70 text-slate-700 leading-relaxed text-sm">
                When IPFS pinning is enabled (via Pinata), commitment metadata is pinned to the InterPlanetary
                File System for decentralized storage. This data is publicly accessible to anyone with the
                content identifier (CID). Families can opt out of IPFS pinning — when disabled, only a local
                cryptographic hash is stored.
              </p>
            </div>
            <div className="dark:bg-white/5 bg-slate-50 rounded-2xl p-5 dark:border-white/10 border-slate-200">
              <h3 className="dark:text-white text-slate-900 font-semibold mb-2">Data Retention & Deletion</h3>
              <p className="dark:text-white/70 text-slate-700 leading-relaxed text-sm">
                You may request deletion of your family's commitment data at any time. Deletion requests
                remove all associated records from the database. IPFS-pinned content cannot be deleted from
                the decentralized network once pinned, but the on-platform reference to it will be removed.
              </p>
            </div>
          </div>
        </section>

        {/* AI Assistant & Third-Party Services */}
        <section className="mb-10 border-l-2 border-amber-400/40 pl-6">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4 flex items-center gap-3">
            <FileText className="w-6 h-6 text-amber-400" />
            AI Assistant (Welli) &amp; Third-Party Services
          </h2>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed">
            Digital Guardian Wellness includes an AI assistant named "Welli" that answers questions about
            digital safety, screen time, and site navigation. When you use Welli, your question text is sent
            to a third-party language-model provider (OpenRouter / the configured model provider) to generate
            a response. <strong>We do not control how that provider processes, stores, or retains your input.</strong>
          </p>
          <div className="mt-4 space-y-3 dark:text-white/70 text-slate-700 leading-relaxed">
            <p>
              <span className="font-semibold dark:text-white text-slate-900">What is sent:</span> only the
              text of your question and a small set of curated FAQ context. We do not attach your name, email,
              account ID, or family data to the request.
            </p>
            <p>
              <span className="font-semibold dark:text-white text-slate-900">Third-party handling:</span> the
              provider may log, retain, or use inputs according to its own privacy policy and terms. Please
              review OpenRouter's privacy policy before using Welli if this matters to you. We cannot delete
              data once it has been sent to the provider.
            </p>
            <p>
              <span className="font-semibold dark:text-white text-slate-900">Your choice:</span> Welli is
              optional. If you prefer not to send questions to a third party, do not use the chat widget —
              all other site features work without it.
            </p>
          </div>
          <div className="mt-6 space-y-3">
            <h3 className="dark:text-white text-slate-900 font-semibold text-sm">Other third-party processors we rely on</h3>
            <ul className="space-y-2 text-sm dark:text-white/70 text-slate-700">
              <li><span className="font-semibold">Neon (Postgres)</span> — cloud database for family commitments and progress.</li>
              <li><span className="font-semibold">Vercel</span> — hosting and optional analytics (analytics disabled until consent).</li>
              <li><span className="font-semibold">Pinata (optional)</span> — IPFS pinning of commitment metadata.</li>
              <li><span className="font-semibold">Google reCAPTCHA</span> — bot protection on forms.</li>
              <li><span className="font-semibold">OpenRouter</span> — LLM inference for the Welli assistant.</li>
            </ul>
          </div>
        </section>
        <section className="mb-10 border-l-2 border-[#4FD1C5]/40 pl-6">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4 flex items-center gap-3">
            <MonitorSmartphone className="w-6 h-6 text-[#4FD1C5]" />
            The Browser Extension
          </h2>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed">
            The Digital Guardian browser extension enforces the family commitments you create on this site.
            It is a companion to your commitments, not a separate service, and it is deliberately built to
            collect as little as possible.
          </p>
          <div className="mt-6 space-y-4">
            <div className="dark:bg-white/5 bg-slate-50 rounded-2xl p-5 dark:border-white/10 border-slate-200">
              <h3 className="dark:text-white text-slate-900 font-semibold mb-2">What the extension stores on your device</h3>
              <p className="dark:text-white/70 text-slate-700 leading-relaxed text-sm">
                Your family access key, the commitments fetched from your family's account, which family
                member uses that browser, and a timestamp of the last sync. All of it stays in your browser's
                own extension storage. Caching commitments locally is what allows the rules to keep working
                when the network is unavailable.
              </p>
            </div>

            <div className="dark:bg-white/5 bg-slate-50 rounded-2xl p-5 dark:border-white/10 border-slate-200">
              <h3 className="dark:text-white text-slate-900 font-semibold mb-2">What the extension sends us</h3>
              <p className="dark:text-white/70 text-slate-700 leading-relaxed text-sm">
                One thing: your family access key, sent to digitalguardianwellness.org to fetch that
                family's commitments. The key is what identifies which family's commitments belong to you —
                it is a credential, so treat it as one. Nothing else leaves your browser.
              </p>
            </div>

            <div className="dark:bg-white/5 bg-slate-50 rounded-2xl p-5 dark:border-white/10 border-slate-200">
              <h3 className="dark:text-white text-slate-900 font-semibold mb-2">What the extension does not collect</h3>
              <p className="dark:text-white/70 text-slate-700 leading-relaxed text-sm">
                It does not record your browsing history. It does not log which sites you visit or how often.
                It sends no analytics, no telemetry, and no crash reports, and it contacts no origin other
                than digitalguardianwellness.org. To decide whether a rule applies to a page, it reads only
                that page's domain name — never its content — and keeps that decision entirely local.
              </p>
            </div>

            <div className="dark:bg-white/5 bg-slate-50 rounded-2xl p-5 dark:border-white/10 border-slate-200">
              <h3 className="dark:text-white text-slate-900 font-semibold mb-2">What it does when a rule applies</h3>
              <p className="dark:text-white/70 text-slate-700 leading-relaxed text-sm">
                A commitment can either block a site during the hours you agreed, or let it load and show the
                agreement as a reminder. Either way, what a family member sees is the wording your family
                wrote. The extension enforces your commitments; it does not decide what they are.
              </p>
            </div>

            <div className="dark:bg-white/5 bg-slate-50 rounded-2xl p-5 dark:border-white/10 border-slate-200">
              <h3 className="dark:text-white text-slate-900 font-semibold mb-2">Removing the extension</h3>
              <p className="dark:text-white/70 text-slate-700 leading-relaxed text-sm">
                Removing it from your browser deletes everything it stored there. Your commitments on this
                site are unaffected. If a device key is lost or a laptop is handed on, a family
                administrator can revoke that device's access from the Family Commitments page.
              </p>
            </div>
          </div>
          <p className="dark:text-amber-200/80 text-amber-800/80 mt-4 text-sm bg-amber-200/10 dark:bg-amber-200/10 rounded-xl p-4 dark:border-amber-200/20 border-amber-200/20">
            Because the access key is stored in the browser, anyone using that browser can read your family's
            commitments. Pair the extension only on devices your family controls.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4">
            Your Rights (GDPR / PDP)
          </h2>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed mb-4">
            Depending on where you live, you may have the right to: access the personal data we hold about
            you; correct inaccurate data; request deletion ("right to be forgotten"); restrict or object to
            processing; receive your data in a portable format; and withdraw consent at any time. To exercise
            any of these rights, contact us at hello@digitalguardianwellness.org.
          </p>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed mb-4">
            <span className="font-semibold dark:text-white text-slate-900">Lawful basis:</span> we process
            data on the basis of consent (analytics), contract (account/family features), and legitimate
            interest (security, platform improvement). Where consent is the basis, you can withdraw it at any
            time without affecting prior processing.
          </p>
          <div className="space-y-3 dark:text-white/70 text-slate-700 leading-relaxed">
            <p>
              You can usually delete local progress from your browser. For information stored on our servers,
              you may be able to request access, correction, or deletion depending on the feature and where you
              are located.
            </p>
            <p>
              You can adjust cookie choices through your browser and through any consent controls we provide.
            </p>
            <p>
              If you do not want certain information collected, the safest option may be not to use the feature
              that collects it.
            </p>
          </div>
        </section>

        {/* Data usage */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4">
            Data usage and what we collect
          </h2>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed">
            We collect the minimum a family needs to cooperate: the commitments they agree to, the devices that
            hold the access key, and a per-device family access token. Everything else is none.
          </p>
          <ul className="list-disc pl-5 -mt-2 space-y-2 text-slate-300">
            <li>
              <span className="font-semibold text-slate-100">Personally identifiable information:</span>
              <span className="text-slate-300"> None collected.</span>
            </li>
            <li>
              <span className="font-semibold text-slate-100">Health information:</span>
              <span className="text-slate-300"> None collected.</span>
            </li>
            <li>
              <span className="font-semibold text-slate-100">Financial and payment information:</span>
              <span className="text-slate-300"> None collected.</span>
            </li>
            <li>
              <span className="font-semibold text-slate-100">Authentication information:</span>
              <span className="text-slate-300"> None collected. The only credential is the family access key, and it stays local on the device.</span>
            </li>
            <li>
              <span className="font-semibold text-slate-100">Personal communications:</span>
              <span className="text-slate-300"> None collected.</span>
            </li>
            <li>
              <span className="font-semibold text-slate-100">Location:</span>
              <span className="text-slate-300"> None collected. No geolocation, GPS, or nearby-device APIs are used.</span>
            </li>
            <li>
              <span className="font-semibold text-slate-100">Web history:</span>
              <span className="text-slate-300"> None collected. We do not record the pages you visit, their titles, or visit times.</span>
            </li>
            <li>
              <span className="font-semibold text-slate-100">User activity:</span>
              <span className="text-slate-300"> None collected. No mouse, scroll, keystroke, or network monitoring beyond the rule engine's own enforcement.</span>
            </li>
            <li>
              <span className="font-semibold text-slate-100">Website content:</span>
              <span className="text-slate-300"> None collected. No page text, images, audio, video, or hyperlinks are read.</span>
            </li>
          </ul>
          <p className="dark:text-white/60 text-slate-700 leading-relaxed mt-4 text-sm">
            What leaves the device is the family's own data, only: the commitments, the packs, and the device keys,
            synced under the family access key to the family's own server. Nothing else. The browser extension
            is a client — it does not sell, track, or profile you.
          </p>
        </section>

        {/* Disclosure */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4">
            Sharing & Disclosure
          </h2>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed">
            We do not share personal information with third parties for their own marketing purposes as part of
            this project. We may share information where we are legally required to do so, or where it is
            necessary to operate a feature and the user has agreed to it.
          </p>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed mt-4">
            If the platform ever adds integrations with other services, those services may have their own
            privacy policies, and we would describe that in the relevant feature.
          </p>
        </section>

        {/* Contact */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4">
            Contact Us
          </h2>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed">
            If you have questions about this policy, your data, or a family feature, you can contact the
            project team through the channels associated with Digital Guardian Wellness.
          </p>
          <p className="dark:text-white/60 text-slate-500 mt-3 text-sm">
            When in doubt, ask before sharing. That is especially important for children and families.
          </p>
        </section>

        {/* Footer note */}
        <div className="mt-16 pt-6 dark:border-white/10 border-slate-200 text-center text-sm dark:text-white/40 text-slate-400">
          <Globe className="w-4 h-4 inline mr-1 dark:text-white/40 text-slate-400" />
          Digital Guardian Wellness — Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
