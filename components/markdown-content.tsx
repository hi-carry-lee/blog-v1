"use client";

import { useEffect } from "react";

export function MarkdownContent({ html }: { html: string }) {
  useEffect(() => {
    // Add copy button functionality
    const copyButtons = document.querySelectorAll(".copy-code-btn");

    const handleCopy = (event: Event) => {
      const button = event.currentTarget as HTMLButtonElement;
      const code = button.getAttribute("data-code");
      const copyText = button.querySelector(".copy-text");

      if (code && copyText) {
        navigator.clipboard
          .writeText(code)
          .then(() => {
            copyText.textContent = "Copied!";
            setTimeout(() => {
              copyText.textContent = "Copy";
            }, 2000);
          })
          .catch((err) => {
            console.error("Failed to copy:", err);
          });
      }
    };

    copyButtons.forEach((button) => {
      button.addEventListener("click", handleCopy);
    });

    // Cleanup
    return () => {
      copyButtons.forEach((button) => {
        button.removeEventListener("click", handleCopy);
      });
    };
  }, [html]);

  return (
    <div
      className="prose prose-lg dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
