export default function ItemCard({ children, selected, style, ...props }) {
  return (
    <div
      style={{
        background: "var(--brand-board-inset)",
        borderRadius: 10,
        border: selected
          ? "1.5px solid var(--brand-accent-mustard)"
          : "1px solid rgba(183,165,134,0.3)",
        padding: "14px 16px",
        position: "relative",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
