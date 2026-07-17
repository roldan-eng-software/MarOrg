import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, rightElement, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-[#3D2519]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            className={cn(
              "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm",
              "placeholder:text-[#8B7A6B]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B3A29] focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-red-500 focus-visible:ring-red-500"
                : "border-[#D4C4B0] focus-visible:ring-[#5B3A29]",
              rightElement ? "pr-10" : "",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
