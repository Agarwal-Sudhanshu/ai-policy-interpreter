type AlertProps = {
  children: React.ReactNode;
  variant?: "error" | "success" | "info" | "warning";
  role?: "alert" | "status";
  className?: string;
  /** When true, render as a box with border and background */
  box?: boolean;
};

const variantClass = {
  error: "text-red-600",
  success: "text-green-700",
  info: "text-gray-700",
  warning: "text-amber-800",
} as const;

const boxVariantClass = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-green-200 bg-green-50 text-green-800",
  info: "border-gray-200 bg-gray-100 text-gray-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
} as const;

export function Alert({
  children,
  variant = "error",
  role = "alert",
  className = "",
  box = false,
}: AlertProps) {
  if (box) {
    return (
      <div
        className={`rounded-xl border p-4 text-sm ${boxVariantClass[variant]} ${className}`}
        role={role}
      >
        {children}
      </div>
    );
  }
  return (
    <p className={`text-sm ${variantClass[variant]} ${className}`} role={role}>
      {children}
    </p>
  );
}
