import type { ReactNode } from "react";
import { InfoDot } from "./Tooltip";

/**
 * Title = the question this card answers. Subtitle = metric · window · timezone.
 * `info` = the full methodology. The plot carries none of it (reference/naming.md).
 *
 * The actions slot takes only things that DESCRIBE the card (a drill-down link, a
 * status chip, a count). Controls that change the data go inside the body, above
 * the content they affect, or they read as page-level filters.
 */
export function Card({
  title, subtitle, info, actions, className = "", children,
}: {
  title?: string; subtitle?: string; info?: ReactNode; actions?: ReactNode;
  className?: string; children: ReactNode;
}) {
  return (
    <section className={`jr-card ${className}`}>
      {(title || actions) && (
        <header className="jr-card__header">
          <div style={{ minWidth: 0 }}>
            {title && (
              <h2 className="jr-card__title">
                {title}
                {info && <InfoDot text={info} about={title} />}
              </h2>
            )}
            {subtitle && <p className="jr-card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="jr-card__actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="jr-empty">{children}</p>;
}
