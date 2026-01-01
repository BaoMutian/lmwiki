import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  FileText, 
  Github, 
  Globe, 
  BookOpen,
  FileCode,
  Newspaper
} from "lucide-react";
import type { ParsedModel } from "@/lib/db/models";

interface ResourcesCardProps {
  model: ParsedModel;
}

export function ResourcesCard({ model }: ResourcesCardProps) {
  const resources = [
    {
      icon: FileText,
      label: "论文",
      url: model.urlPaper,
      color: "hover:bg-red-500/10 hover:text-red-500",
    },
    {
      icon: () => (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.5 3h1v1h-1V3zm-3 2h1v1h-1V5zm3 0h2v1h-2V5zm3 0h1v1h-1V5zm-6 2h1v1H8.5V7zm3 0h3v1h-3V7zm4 0h1v1h-1V7zM7 9h2v1H7V9zm4 0h4v1h-4V9zm5 0h1v1h-1V9zm-9 2h3v1H7v-1zm4 0h4v1h-4v-1zm5 0h2v1h-2v-1zm-9 2h4v1H7v-1zm5 0h3v1h-3v-1zm4 0h2v1h-2v-1zm-8 2h3v1H8v-1zm4 0h4v1h-4v-1zm5 0h1v1h-1v-1zm-8 2h2v1H9v-1zm3 0h3v1h-3v-1zm4 0h2v1h-2v-1zm-5 2h3v1h-3v-1z"/>
        </svg>
      ),
      label: "HuggingFace",
      url: model.urlHuggingface,
      color: "hover:bg-yellow-500/10 hover:text-yellow-600",
    },
    {
      icon: Github,
      label: "GitHub",
      url: model.urlGithub,
      color: "hover:bg-gray-500/10 hover:text-gray-500",
    },
    {
      icon: Globe,
      label: "官方演示",
      url: model.urlDemo,
      color: "hover:bg-blue-500/10 hover:text-blue-500",
    },
    {
      icon: FileCode,
      label: "API文档",
      url: model.urlApiDocs,
      color: "hover:bg-green-500/10 hover:text-green-500",
    },
    {
      icon: Newspaper,
      label: "博客文章",
      url: model.urlBlog,
      color: "hover:bg-purple-500/10 hover:text-purple-500",
    },
    {
      icon: Globe,
      label: "官网",
      url: model.urlWebsite,
      color: "hover:bg-primary/10 hover:text-primary",
    },
  ].filter((r) => r.url);

  if (resources.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          资源链接
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {resources.map(({ icon: Icon, label, url, color }) => (
            <a
              key={label}
              href={url!}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 ${color}`}
              >
                <Icon />
                <span className="flex-1 text-left truncate">{label}</span>
                <ExternalLink className="h-4 w-4 opacity-50" />
              </Button>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

