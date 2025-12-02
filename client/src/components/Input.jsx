import { cn } from "../lib/utils";

const baseField =
  "w-full px-4 py-2.5 border rounded-lg bg-white transition-all outline-none " +
  "focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

export const Input = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        {...props}
        className={cn(
          baseField,
          error && "border-red-500 focus:ring-red-500",
          className
        )}
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const TextArea = ({ label, error, className, rows = 4, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        {...props}
        rows={rows}
        className={cn(
          baseField,
          "resize-none",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const Select = ({ label, error, options = [], className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        {...props}
        className={cn(
          baseField,
          error && "border-red-500 focus:ring-red-500",
          className
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
