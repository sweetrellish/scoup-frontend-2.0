interface ComingSoonPageProps {
  title: string;
  description: string;
  endpoint?: string;
}

/** Placeholder for sidebar destinations whose backend surface isn't built yet. */
export function ComingSoonPage({ title, description, endpoint }: ComingSoonPageProps) {
  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <p className="text-sm text-gray-600 mt-2">{description}</p>

      <div className="mt-6 border border-dashed border-gray-300 rounded-lg p-6 bg-white">
        <p className="text-sm text-gray-700 font-medium">Not yet implemented</p>
        <p className="text-sm text-gray-600 mt-1">
          This page is wired into navigation so the layout can be reviewed, but it has no
          backend data yet.
        </p>
        {endpoint && (
          <p className="text-xs text-gray-500 mt-3">
            Planned endpoint: <code className="bg-gray-100 px-1 py-0.5 rounded">{endpoint}</code>
          </p>
        )}
      </div>
    </div>
  );
}
