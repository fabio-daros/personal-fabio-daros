import Link from "next/link";
import type { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  description?: string;
  afterDescription?: ReactNode;
  action?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function PageTitle({
  title,
  description,
  afterDescription,
  action,
  breadcrumbs,
}: PageTitleProps) {
  return (
    <div className="page-title" data-aos="fade">
      <div className="heading">
        <div className="container">
          <div className="row d-flex justify-content-center text-center">
            <div className="col-lg-8">
              <h2>{title}</h2>
              {description && <p className="mb-0">{description}</p>}
              {afterDescription ? <div className="page-title__after-description">{afterDescription}</div> : null}
              {action ? <div className="page-title__action">{action}</div> : null}
            </div>
          </div>
        </div>
      </div>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="breadcrumbs">
          <div className="container">
            <ol>
              {breadcrumbs.map((item, i) => (
                <li key={i} className={item.href ? undefined : "current"}>
                  {item.href ? (
                    <Link href={item.href}>{item.label}</Link>
                  ) : (
                    item.label
                  )}
                </li>
              ))}
            </ol>
          </div>
        </nav>
      )}
    </div>
  );
}
