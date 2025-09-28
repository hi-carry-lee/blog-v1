"use client";

import { Toaster as Sonner } from "sonner";
import { useAppTheme } from "@/lib/hooks/useAppTheme";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useAppTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:border-primary",
          error:
            "group-[.toast]:bg-destructive group-[.toast]:text-destructive-foreground group-[.toast]:border-destructive",
          info: "group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground group-[.toast]:border-secondary",
          warning:
            "group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground group-[.toast]:border-secondary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
