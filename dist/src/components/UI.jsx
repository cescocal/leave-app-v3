export function Button({ children, variant = "primary", ...props }) {
  const base =
    "px-4 py-2 rounded font-medium transition-colors duration-150";

  const styles = {
    primary: "bg-cescoBlue text-white hover:bg-cescoBlueDark",
    secondary: "bg-slate-200 text-slate-700 hover:bg-slate-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button className={`${base} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
}

export function Input({ label, ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        {...props}
        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-cescoBlue"
      />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        {...props}
        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-cescoBlue"
      >
        {children}
      </select>
    </div>
  );
}

export function TextArea({ label, ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-cescoBlue"
      />
    </div>
  );
}
