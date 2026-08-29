import type { MouseEvent, ReactNode } from "react";

interface FacultyLinkProps {
  /** Faculty primary key. Anything non-numeric is rendered as plain text. */
  facultyId: number | string | null | undefined;
  onNavigate?: (path: string) => void;
  className?: string;
  children: ReactNode;
}

/**
 * Link to a public faculty profile through the hand-rolled router.
 *
 * A real `<a href>` rather than a button, so the URL is visible on hover,
 * copyable, and openable in a new tab — modified clicks are left to the browser
 * and only a plain left click is intercepted for client-side navigation.
 *
 * Falls back to plain text when there is no usable id or no navigate handler,
 * so callers never render a link that goes nowhere.
 */
export function FacultyLink({
  facultyId,
  onNavigate,
  className = "",
  children,
}: FacultyLinkProps) {
  const id = facultyId == null ? "" : String(facultyId);
  const linkable = onNavigate && /^\d+$/.test(id);

  if (!linkable) {
    return <span className={className}>{children}</span>;
  }

  const path = `/faculty/${id}`;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    // Stop the click from also triggering an enclosing card's onClick.
    event.stopPropagation();
    onNavigate!(path);
  };

  return (
    <a href={path} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
