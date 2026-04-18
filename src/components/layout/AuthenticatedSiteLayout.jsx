/**
 * Wraps marketing-style site pages when viewed inside the logged-in app shell.
 * Keeps editorial width and consistent padding with the rest of the workspace.
 */
export default function AuthenticatedSiteLayout({ children, narrow = false }) {
  return (
    <div
      style={{
        padding: "26px 26px 48px",
        maxWidth: narrow ? 720 : 900,
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}
