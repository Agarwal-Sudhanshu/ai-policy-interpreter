type CardProps = {
  children: React.ReactNode;
  /** Optional section title inside the card */
  title?: string;
  /** Whether to add padding around body. Default true; set false for custom layout (e.g. table/list). */
  padding?: boolean;
  className?: string;
};

export function Card({
  children,
  title,
  padding = true,
  className = "",
}: CardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {title && (
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        </div>
      )}
      {padding ? <div className="p-6">{children}</div> : children}
    </div>
  );
}
