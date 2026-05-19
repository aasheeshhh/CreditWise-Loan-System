import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function Nav() {
  const { theme, toggle } = useTheme();
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="mx-auto max-w-6xl px-4 mt-3">
        <div className="glass rounded-2xl flex items-center justify-between px-4 py-2.5 shadow-soft">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            Credexa
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <Link to="/" hash="features" className="hover:text-foreground transition-colors">Features</Link>
            <Link to="/predict" className="hover:text-foreground transition-colors">Predict</Link>
            <Link to="/" hash="insights" className="hover:text-foreground transition-colors">Insights</Link>
            
          </nav>
          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle theme"
              onClick={toggle}
              className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              to="/predict"
              className="hidden sm:inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Check Eligibility
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
