import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function RadioGroup({ value, onValueChange, children, className }: RadioGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            checked: child.props.value === value,
            onChange: () => onValueChange(child.props.value),
          });
        }
        return child;
      })}
    </div>
  );
}

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

export function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  return (
    <input
      type="radio"
      className={cn("h-4 w-4 text-primary", className)}
      {...props}
    />
  );
}
