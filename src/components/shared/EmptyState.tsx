import { type ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-8 px-4 ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-[#9BFF30] flex items-center justify-center mb-4 text-2xl">
          {icon}
        </div>
      )}
      <p className="text-[15px] font-medium text-white">{title}</p>
      {description && (
        <p className="text-[13px] text-gray-400 mt-1 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
