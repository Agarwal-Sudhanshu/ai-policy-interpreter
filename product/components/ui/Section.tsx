type SectionProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Section({
  title,
  children,
  className = "",
}: SectionProps) {
  return (
    <section className={className}>
      {title && (
        <h3 className="mb-4 text-base font-semibold text-gray-900">{title}</h3>
      )}
      {children}
    </section>
  );
}
