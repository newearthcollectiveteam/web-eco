// Route group layout - individual pages define their own layouts
// Pages that need full site layout include it in their own layout.tsx
export default function SiteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
