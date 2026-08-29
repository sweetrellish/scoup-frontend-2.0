import { Database } from "lucide-react";

interface NoDataYetPageProps {
  title: string;
  description: string;
  /** What exists today — schema, endpoint, or write path. */
  whatExists: string;
  /** Why there is nothing to show, stated plainly. */
  whyEmpty: string;
  /** What would have to happen for this page to hold data. */
  whatWouldFillIt: string[];
}

/**
 * An honest empty state for a page whose data source genuinely has no records.
 *
 * Distinct from ComingSoonPage, which means "not built yet". This means "built,
 * connected, and legitimately empty" — so it states what exists, why it is
 * empty and what would fill it, rather than showing invented placeholder rows.
 */
export function NoDataYetPage({
  title,
  description,
  whatExists,
  whyEmpty,
  whatWouldFillIt,
}: NoDataYetPageProps) {
  return (
    <div className="p-8 max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </header>

      <div className="border border-gray-200 rounded-lg bg-white p-6">
        <div className="flex items-center gap-2 text-gray-700">
          <Database className="w-5 h-5 text-gray-400" aria-hidden="true" />
          <p className="font-medium">No records yet</p>
        </div>

        <p className="text-sm text-gray-600 mt-3">{whyEmpty}</p>

        <dl className="mt-6 space-y-4 text-sm">
          <div>
            <dt className="font-medium text-gray-700">What exists today</dt>
            <dd className="text-gray-600 mt-1">{whatExists}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">What would populate this page</dt>
            <dd className="mt-1">
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {whatWouldFillIt.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>

        <p className="text-xs text-gray-400 mt-6">
          This page shows nothing rather than sample data, so a count of zero here is a fact
          about the dataset, not a placeholder.
        </p>
      </div>
    </div>
  );
}
