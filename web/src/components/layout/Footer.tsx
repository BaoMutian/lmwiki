import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Description */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="font-bold text-gradient">LMWiki</span>
            <span className="text-muted-foreground text-sm ml-2">
              —— 大模型百科全书
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              模型百科
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors opacity-50 cursor-not-allowed">
              跑分实验室
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors opacity-50 cursor-not-allowed">
              社区评价
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} LMWiki. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

