"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Italic,
  Link,
  Image,
  Code,
  List,
  ListOrdered,
  Quote,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import {
  markdownToHtml,
  insertImageToMarkdown,
  getMarkdownStats,
} from "@/lib/markdown";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
  showStats?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content in Markdown...",
  disabled = false,
  minHeight = 300,
  showStats = true,
}: MarkdownEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useSemanticToast();

  // Update HTML preview when markdown changes
  useEffect(() => {
    const updatePreview = async () => {
      if (isPreviewMode && value) {
        const html = await markdownToHtml(value);
        setHtmlContent(html);
      }
    };
    updatePreview();
  }, [value, isPreviewMode]);

  // Handle copy button clicks in preview mode
  useEffect(() => {
    if (!isPreviewMode) return;

    const handleCopyClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest(".copy-code-btn") as HTMLButtonElement;
      if (!button) return;

      // 阻止默认行为和事件冒泡，防止触发表单提交
      e.preventDefault();
      e.stopPropagation();

      const code = button.getAttribute("data-code");
      if (!code) return;

      try {
        // Decode HTML entities
        const decodedCode = code
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&");

        await navigator.clipboard.writeText(decodedCode);

        // Update button text to show success
        const copyText = button.querySelector(".copy-text");
        if (copyText) {
          const originalText = copyText.textContent;
          copyText.textContent = "Copied!";
          button.classList.add("bg-green-100", "dark:bg-green-900");

          setTimeout(() => {
            copyText.textContent = originalText;
            button.classList.remove("bg-green-100", "dark:bg-green-900");
          }, 2000);
        }

        success("Code copied!", "The code has been copied to your clipboard.");
      } catch (err) {
        console.error("Failed to copy code:", err);
        error("Copy failed", "Failed to copy code to clipboard.");
      }
    };

    document.addEventListener("click", handleCopyClick);
    return () => document.removeEventListener("click", handleCopyClick);
  }, [isPreviewMode, success, error]);

  // Insert text at cursor position
  const insertAtCursor = (insertText: string, wrapSelection = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newText;
    let newCursorPos;

    if (wrapSelection && selectedText) {
      // Wrap selected text
      newText =
        value.substring(0, start) +
        insertText +
        selectedText +
        insertText +
        value.substring(end);
      newCursorPos =
        start + insertText.length + selectedText.length + insertText.length;
    } else {
      // Insert at cursor
      newText = value.substring(0, start) + insertText + value.substring(end);
      newCursorPos = start + insertText.length;
    }

    onChange(newText);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Toolbar action handlers
  const handleBold = () => insertAtCursor("**", true);
  const handleItalic = () => insertAtCursor("*", true);
  const handleCode = () => insertAtCursor("`", true);

  const handleLink = () => {
    const selectedText = getSelectedText();
    const linkText = selectedText || "Link Text";
    insertAtCursor(`[${linkText}](https://example.com)`);
  };

  const handleList = () => {
    insertAtCursor("\n- List item", false);
  };

  const handleOrderedList = () => {
    insertAtCursor("\n1. List item", false);
  };

  const handleQuote = () => {
    insertAtCursor("\n> Quote text", false);
  };

  const getSelectedText = () => {
    const textarea = textareaRef.current;
    if (!textarea) return "";
    return value.substring(textarea.selectionStart, textarea.selectionEnd);
  };

  // Image upload handling
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      error("Invalid file type", "Please select a JPEG, PNG, or WebP image.");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      error("File too large", "Please select an image smaller than 5MB.");
      return;
    }

    setIsUploadingImage(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "images"); // Use 'images' folder as requested

      // Upload to Cloudinary
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();

      // Insert image markdown at cursor position
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPosition = textarea.selectionStart;
        const altText = file.name.split(".")[0]; // Use filename as alt text
        const result = insertImageToMarkdown(
          value,
          cursorPosition,
          data.url,
          altText
        );
        onChange(result.newMarkdown);

        // Set cursor position after image
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            result.newCursorPosition,
            result.newCursorPosition
          );
        }, 0);
      }

      success("Image uploaded!", "Image has been inserted into your content.");
    } catch (err) {
      console.error("Image upload error:", err);
      error("Upload failed", "An unexpected error occurred. Please try again.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Get markdown statistics
  const stats = showStats ? getMarkdownStats(value) : null;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBold}
            disabled={disabled}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleItalic}
            disabled={disabled}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCode}
            disabled={disabled}
            className="h-8 w-8 p-0"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLink}
            disabled={disabled}
            className="h-8 w-8 p-0"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleImageClick}
            disabled={disabled || isUploadingImage}
            className="h-8 w-8 p-0"
          >
            {isUploadingImage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Image className="h-4 w-4" aria-label="Upload image" />
            )}
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleList}
            disabled={disabled}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleOrderedList}
            disabled={disabled}
            className="h-8 w-8 p-0"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleQuote}
            disabled={disabled}
            className="h-8 w-8 p-0"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          disabled={disabled}
          className="h-8 px-3"
        >
          {isPreviewMode ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Edit
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </>
          )}
        </Button>
      </div>

      {/* Editor/Preview Area */}
      <div className="relative">
        {isPreviewMode ? (
          <div
            className="markdown-preview p-6 min-h-[300px] overflow-auto prose prose-sm max-w-none dark:prose-invert"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="border-0 focus-visible:ring-0 resize-none font-mono text-sm"
            style={{ minHeight }}
            rows={Math.max(10, Math.ceil(minHeight / 24))}
          />
        )}
      </div>

      {/* Stats Footer */}
      {showStats && stats && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{stats.words} words</span>
            <span>{stats.characters} characters</span>
            <span>{stats.lines} lines</span>
          </div>
          <div className="text-xs">Markdown supported</div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
