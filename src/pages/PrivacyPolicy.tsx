import { Link } from "react-router-dom";
import { Shield, ArrowLeft, RefreshCw, Globe, Clock, FileText } from "lucide-react";

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
            Last updated: March 2026
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
          <p className="dark:text-amber-200/80 text-amber-800/80 mt-4 text-sm bg-amber-200/10 dark:bg-amber-200/10 rounded-xl p-4 dark:border-amber-200/20 border-amber-200/20">
            Please note: we are not lawyers. This is a general statement of intent, not legal advice. If your
            situation involves children's privacy law in a specific country or state, you may want to confirm
            the details with a qualified professional.
          </p>
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

        {/* Choices */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4">
            Your Choices
          </h2>
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
