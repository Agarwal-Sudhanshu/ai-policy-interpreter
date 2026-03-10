type EmptyStateProps = {
  message: React.ReactNode;
  /** Optional action (e.g. link or button) */
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  message,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`px-6 py-12 text-center text-sm text-gray-500 ${className}`}
    >
      <p>{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
