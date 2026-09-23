import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-white/10 dark:border-black/10 bg-white/10 dark:bg-black/10 backdrop-blur-xl px-4 py-3">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
        <Link
          to="/privacy-policy"
          className="underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Privacy Policy
        </Link>
        <Link
          to="/terms-of-service"
          className="underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Terms of Service
        </Link>
        <span className="text-muted/40">|</span>
        <span>© 2026 Digital Guardian Wellness</span>
      </div>
    </footer>
  );
};

export default Footer;
