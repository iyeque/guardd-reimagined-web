import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-white/10 bg-white/5 backdrop-blur-xl px-4 py-3">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 text-sm text-white/50">
        <Link
          to="/privacy"
          className="underline underline-offset-4 hover:text-white/80 transition-colors"
        >
          Privacy Policy
        </Link>
        <Link
          to="/terms"
          className="underline underline-offset-4 hover:text-white/80 transition-colors"
        >
          Terms of Service
        </Link>
        <span className="text-white/20">|</span>
        <span>© 2026 Digital Guardian Wellness</span>
      </div>
    </footer>
  );
};

export default Footer;
