/**
 * Top bar title for AppShell based on current path.
 */
export function getAppShellPageTitle(pathname) {
  if (pathname.startsWith("/profile")) return "Profile";
  if (pathname === "/about") return "About";
  if (pathname === "/contact") return "Contact";
  if (pathname.startsWith("/blog")) return "Blog";
  return "Projects";
}
