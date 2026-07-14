import type { ReactNode } from 'react';

export interface RecordColumn<T> {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
}

export function ResponsiveRecords<T>({
  columns,
  getKey,
  items,
}: {
  columns: Array<RecordColumn<T>>;
  getKey: (item: T, index: number) => string;
  items: T[];
}) {
  return (
    <>
      <div className="desktop-record-table">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={getKey(item, index)}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render(item)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mobile-record-list">
        {items.map((item, index) => (
          <article className="mobile-record" key={getKey(item, index)}>
            {columns.map((column) => (
              <div key={column.key}>
                <span>{column.label}</span>
                <strong>{column.render(item)}</strong>
              </div>
            ))}
          </article>
        ))}
      </div>
    </>
  );
}
