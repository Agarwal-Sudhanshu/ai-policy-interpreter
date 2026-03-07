type PageContainerProps = {
  children: React.ReactNode;
  /** Spacing between sections. Default: 8 */
  spacing?: 6 | 8;
};

const spacingClass = {
  6: "space-y-6",
  8: "space-y-8",
} as const;

export function PageContainer({
  children,
  spacing = 8,
}: PageContainerProps) {
  return <div className={spacingClass[spacing]}>{children}</div>;
}
