import React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef((props, ref) => {
  const { className, ...rest } = props;
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] focus:ring-2 focus:outline-none focus:ring-blue-100 appearance-none w-full text-sm leading-6 text-slate-900 placeholder-slate-400 rounded-md py-2 pl-4 ring-1 ring-slate-200 shadow-sm",
        className
      )}
      ref={ref}
      {...rest}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
