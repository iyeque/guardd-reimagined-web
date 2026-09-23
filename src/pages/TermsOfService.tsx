import { Link } from "react-router-dom";
import { FileText, ArrowLeft, Scale, Shield, Users, Clock, Download } from "lucide-react";

const TermsOfService = () => {
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
            <FileText className="w-4 h-4 dark:text-white/80 text-slate-600" />
            Rules & Responsibilities
          </div>
          <h1 className="text-4xl font-bold dark:text-white text-slate-900 mb-3">Terms of Service</h1>
          <p className="dark:text-white/60 text-slate-500 text-lg">
            Last updated: March 2026
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4 flex items-center gap-3">
            <Scale className="w-6 h-6 text-[#4FD1C5]" />
            1. What These Terms Cover
          </h2>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed">
            These Terms of Service explain the rules for using the Digital Guardian Wellness platform and any
            related features, tools, courses, workshops, or materials made available through it.
          </p>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed mt-4">
            By using the platform, you agree to these terms, our Privacy Policy, and any feature-specific rules
            we describe when you use a feature.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4 flex items-center gap-3">
            <Users className="w-6 h-6 text-[#4FD1C5]" />
            2. Who Can Use the Platform
          </h2>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed">
            Some features may be intended for adults, parents, guardians, educators, or families. If a feature
            is meant for a child, we expect it to be used with appropriate supervision and in line with the
            rules that apply to that child.
          </p>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed mt-4">
            You should not use the platform in a way that violates the rights of others or breaks applicable law.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4 flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#4FD1C5]" />
            3. How You May Use the Platform
          </h2>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed">
            You may use the platform for its intended purpose: learning about digital wellness, improving online
            safety, and supporting healthier family habits.
          </p>
          <div className="mt-4 dark:bg-white/5 bg-slate-50 rounded-2xl p-5 dark:border-white/10 border-slate-200">
            <h3 className="dark:text-white text-slate-900 font-semibold mb-2">You should not:</h3>
            <ul className="space-y-2 dark:text-white/70 text-slate-700 text-sm list-disc pl-5">
              <li>Use the platform to harass, abuse, or harm others</li>
              <li>Share content that is illegal, dangerous, or infringing</li>
              <li>Try to bypass security, limits, or access controls</li>
              <li>Pretend to be someone else or misrepresent your identity</li>
              <li>Use automated abuse, spam, or scraping in violation of the platform</li>
              <li>Use family or child-related features to collect more data than is needed</li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4 flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#4FD1C5]" />
            4. Family & Child Safety
          </h2>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed">
            If you are using family features, you are responsible for making sure they are used appropriately for
            the people involved, especially children.
          </p>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed mt-4">
            We encourage open conversation, supervision, and age-appropriate use. Family commitment and
            agreement features are meant to support healthy habits, not to pressure or monitor people unfairly.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4 flex items-center gap-3">
            <Download className="w-6 h-6 text-[#4FD1C5]" />
            5. Content and Materials
          </h2>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed">
            Courses, workshops, exercises, and other materials on the platform are provided for learning and
            personal use unless we state otherwise.
          </p>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed mt-4">
            Do not copy, redistribute, or republish platform materials in a way that violates these terms or
            applicable law, unless you have our permission.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4 flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#4FD1C5]" />
            6. Accounts and Progress
          </h2>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed">
            If the platform lets you save progress, certificates, or family data, you are responsible for keeping
            your access details safe and for using the feature in a way that matches its purpose.
          </p>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed mt-4">
            We may limit, suspend, or remove access if we believe a feature is being misused or if we need to
            protect the platform, its users, or the people it is designed to help.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4 flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#4FD1C5]" />
            7. Changes to These Terms
          </h2>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed">
            We may update these terms from time to time as the platform changes. When we do, we will update the
            "last updated" date at the top of this page.
          </p>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed mt-4">
            If a change is important, we will try to make that clear. Continuing to use the platform after a
            change means you accept the updated terms.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold dark:text-white text-slate-900 mb-4 flex items-center gap-3">
            <Scale className="w-6 h-6 text-[#4FD1C5]" />
            8. General
          </h2>
          <p className="dark:text-white/70 text-slate-700 leading-relaxed">
            These terms are a general framework for using the Digital Guardian Wellness platform. They are not a
            substitute for legal advice. If you have a specific legal question, you should speak with a qualified
            professional in your jurisdiction.
          </p>
          <p className="dark:text-white/60 text-slate-500 mt-4 text-sm">
            If any part of these terms is not valid or enforceable, the rest of them should still apply.
          </p>
        </section>

        <div className="mt-16 pt-6 dark:border-white/10 border-slate-200 text-center text-sm dark:text-white/40 text-slate-400">
          <FileText className="w-4 h-4 inline mr-1 dark:text-white/40 text-slate-400" />
          Digital Guardian Wellness — Terms of Service
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
