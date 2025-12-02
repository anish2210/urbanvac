import { cn } from "../lib/utils";

export const Card = ({ children, className, ...props }) => {
  return (
    <div
      {...props}
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-200 p-6",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => {
  return (
    <div className={cn("mb-4 pb-4 border-b border-gray-200", className)}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className }) => {
  return (
    <h3 className={cn("text-xl font-semibold text-gray-900", className)}>
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className }) => {
  return <div className={cn("", className)}>{children}</div>;
};
