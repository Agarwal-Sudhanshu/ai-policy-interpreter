type AlertProps = {
  children: React.ReactNode;
  variant?: "error" | "success" | "info";
  role?: "alert" | "status";
  className?: string;
};

const variantClass = {
  error: "text-red-600",
  success: "text-green-700",
  info: "text-gray-600",
} as const;

export function Alert({
  children,
  variant = "error",
  role = "alert",
  className = "",
}: AlertProps) {
  return (
    <p className={`text-sm ${variantClass[variant]} ${className}`} role={role}>
      {children}
    </p>
  );
}
