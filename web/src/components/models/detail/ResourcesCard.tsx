"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ExternalLink, 
  FileText, 
  Github, 
  Globe, 
  LinkIcon,
  FileCode,
  Newspaper
} from "lucide-react";
import type { ParsedModel } from "@/lib/db/models";

interface ResourcesCardProps {
  model: ParsedModel;
}

// HuggingFace icon component
function HuggingFaceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-.5 2h1v1h-1V4zm-3 1h1v1h-1V5zm3 0h2v1h-2V5zm3 0h1v1h-1V5zm-6 2h1v1H8.5V7zm3 0h3v1h-3V7zm4 0h1v1h-1V7zM7 9h2v1H7V9zm4 0h4v1h-4V9zm5 0h1v1h-1V9zm-9 2h3v1H7v-1zm4 0h4v1h-4v-1zm5 0h2v1h-2v-1zm-9 2h4v1H7v-1zm5 0h3v1h-3v-1zm4 0h2v1h-2v-1zm-8 2h3v1H8v-1zm4 0h4v1h-4v-1zm5 0h1v1h-1v-1zm-8 2h2v1H9v-1zm3 0h3v1h-3v-1zm4 0h2v1h-2v-1zm-5 2h3v1h-3v-1z"/>
    </svg>
  );
}

export function ResourcesCard({ model }: ResourcesCardProps) {
  const resources = [
    {
      icon: FileText,
      label: "论文",
      url: model.urlPaper,
      color: "text-red-500 bg-red-500/10 hover:bg-red-500/20",
    },
    {
      icon: HuggingFaceIcon,
      label: "HuggingFace",
      url: model.urlHuggingface,
      color: "text-yellow-600 bg-yellow-500/10 hover:bg-yellow-500/20",
    },
    {
      icon: Github,
      label: "GitHub",
      url: model.urlGithub,
      color: "text-gray-600 dark:text-gray-400 bg-gray-500/10 hover:bg-gray-500/20",
    },
    {
      icon: Globe,
      label: "官方演示",
      url: model.urlDemo,
      color: "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20",
    },
    {
      icon: FileCode,
      label: "API文档",
      url: model.urlApiDocs,
      color: "text-green-500 bg-green-500/10 hover:bg-green-500/20",
    },
    {
      icon: Newspaper,
      label: "博客文章",
      url: model.urlBlog,
      color: "text-purple-500 bg-purple-500/10 hover:bg-purple-500/20",
    },
    {
      icon: Globe,
      label: "官网",
      url: model.urlWebsite,
      color: "text-primary bg-primary/10 hover:bg-primary/20",
    },
  ].filter((r) => r.url);

  if (resources.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-600/5">
            <LinkIcon className="h-4 w-4 text-indigo-500" />
          </div>
          资源链接
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {resources.map(({ icon: Icon, label, url, color }) => (
            <a
              key={label}
              href={url!}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                flex items-center gap-2 px-3 py-2.5 
                rounded-xl transition-all duration-200
                ring-1 ring-black/[0.02] dark:ring-white/[0.04]
                ${color}
              `}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium truncate flex-1">{label}</span>
              <ExternalLink className="h-3 w-3 opacity-50 shrink-0" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
