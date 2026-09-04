import { content } from "@/data/content";

// Curtain label for a given path — lets "Retour" (CurtainProvider.triggerBack)
// show the right title without every call site tracking it manually.
export function getPageLabel(pathname: string): string {
  if (pathname === "/about") return "Informations";
  const match = pathname.match(/^\/projects\/([^/]+)$/);
  if (match) {
    const project = content.projects.find((p) => p.slug === match[1]);
    if (project) return project.name;
  }
  return "Anthony  Ringressi";
}
