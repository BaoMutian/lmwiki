import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-6">
        {/* Emoji */}
        <div className="text-8xl mb-4">🔍</div>

        {/* Title */}
        <h1 className="text-4xl font-bold">页面未找到</h1>

        {/* Description */}
        <p className="text-muted-foreground max-w-md">
          抱歉，您访问的页面不存在。这可能是因为该模型已被移除或链接已过期。
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link href="/">
            <Button variant="default" className="gap-2">
              <Home className="h-4 w-4" />
              返回首页
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              搜索模型
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

