import * as React from "react";

const badgeVariants = {
  default:
    "border-transparent bg-gray-100 text-gray-700",
  primary:
    "border-transparent bg-[#2563EB]/10 text-[#2563EB]",
  success:
    "border-transparent bg-[#10B981]/10 text-[#10B981]",
  danger:
    "border-transparent bg-[#EF4444]/10 text-[#EF4444]",
  outline:
    "border-gray-200 text-gray-700",
} as const;

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof badgeVariants;
};

export function Badge({
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${badgeVariants[variant]} ${className}`}
      {...props}
    />
  );
}
