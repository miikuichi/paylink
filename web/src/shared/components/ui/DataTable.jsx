import './DataTable.css'

/**
 * columns: [{ key, header, render?(row), align?: 'left'|'right'|'center', onHeaderClick?: Function }]
 */
const DataTable = ({ columns, rows, emptyLabel = 'No records found.' }) => {
  return (
    <div className="dtable-wrap">
      <table className="dtable">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ textAlign: col.align || 'left' }}
                className={col.onHeaderClick ? 'dtable__th--sortable' : ''}
                onClick={col.onHeaderClick}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="dtable__empty">
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id ?? i}>
                {columns.map((col) => (
                  <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
