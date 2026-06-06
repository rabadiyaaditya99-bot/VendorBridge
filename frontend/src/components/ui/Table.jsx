import React from "react";

export default function Table({ headers = [], children, className = "" }) {
  return (
    <div className={`w-full overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <table className="w-full text-left border-collapse min-w-full">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            {headers.map((h, idx) => (
              <th
                key={idx}
                className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
          {children}
        </tbody>
      </table>
    </div>
  );
}
