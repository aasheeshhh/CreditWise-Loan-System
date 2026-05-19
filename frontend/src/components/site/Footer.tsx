import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Credexa — AI loan intelligence.
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <a href="mailto:ashishligade.tech@gmail.com" className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"><Mail className="h-4 w-4" />Contact</a>
          <a href="https://github.com/aasheeshhh" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"><Github className="h-4 w-4" />GitHub</a>
          <a href="https://www.linkedin.com/in/ashishligade/" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"><Linkedin className="h-4 w-4" />LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
