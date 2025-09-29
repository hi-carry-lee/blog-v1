import { toast } from "sonner";

export const useSemanticToast = () => {
  const success = (message: string, description?: string) => {
    toast.success(message, {
      description,
      style: {
        backgroundColor: "var(--success-bg)",
        color: "var(--success-text)",
        borderColor: "var(--success-border)",
      },
    });
  };

  const error = (message: string, description?: string) => {
    toast.error(message, {
      description,
      style: {
        backgroundColor: "var(--error-bg)",
        color: "var(--error-text)",
        borderColor: "var(--error-border)",
      },
    });
  };

  const warning = (message: string, description?: string) => {
    toast.warning(message, {
      description,
      style: {
        backgroundColor: "var(--warning-bg)",
        color: "var(--warning-text)",
        borderColor: "var(--warning-border)",
      },
    });
  };

  const info = (message: string, description?: string) => {
    toast.info(message, {
      description,
      style: {
        backgroundColor: "var(--info-bg)",
        color: "var(--info-text)",
        borderColor: "var(--info-border)",
      },
    });
  };

  return { success, error, warning, info };
};
