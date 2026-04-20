/**
 * Top bar title for AppShell based on current path.
 */
export function getAppShellPageTitle(pathname) {
  if (pathname.startsWith("/project/")) return "";
  if (pathname.startsWith("/profile")) return "Profile";
  if (pathname === "/about") return "About";
  if (pathname === "/contact") return "Contact";
  if (pathname.startsWith("/blog")) return "Blog";
  if (pathname === "/new-project") return "New project";
  return "Projects";
}
