import type { ReactNode } from "react";

type NodeCardProps = {
  children?: ReactNode;
  description: string;
  title: string;
};

export function NodeCard({ children, description, title }: NodeCardProps) {
  return (
    <article
      style={{
        background: "rgba(15, 23, 42, 0.72)",
        border: "1px solid rgba(148, 163, 184, 0.24)",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <h3 style={{ fontSize: 16, margin: 0 }}>{title}</h3>
      <p style={{ color: "#94a3b8", fontSize: 14, margin: "8px 0 0" }}>{description}</p>
      {children}
    </article>
  );
}
