import React, { useEffect, useState } from 'react'
import { Table, Column, Cell } from 'fixed-data-table-2'
import { isEqual } from 'lodash'
import { ColumnWidth, TableProps } from './types'
import { useCompare } from './utils'
import 'fixed-data-table-2/dist/fixed-data-table.css'

// Table data as a list of array.
const rows = [
	'first row',
	'second row',
	'third row',
	// .... and more
]

const infinity = 1.7976931348623157e10308

// Custom cell implementation with special prop
const MyCustomCell = ({ mySpecialProp }: { mySpecialProp: string }) => <Cell>{mySpecialProp === 'column2' ? "I'm column 2" : "I'm not column 2"}</Cell>

export default function TableComponent<T>(
	props: TableProps<T> = {
		columns: [],
		rowHeight: 30,
	}
) {
	const width = window.innerWidth
	const height = window.innerHeight

	const [columnWidth, setColumnWidth] = useState<ColumnWidth[]>([])

	const { columns } = props

	const columnsList = useCompare(columns, isEqual)

	useEffect(() => {
		setColumnWidth(((columnsList as unknown) as ColumnWidth[])?.map((el: ColumnWidth) => ({ key: el.key, width: el.width, minWidth: el.minWidth, maxWidth: el.maxWidth })))
	}, [columnsList])

	function onColumnResizeEndCallback(newColumnWidth: number, columnKey: string) {
		const target = columnWidth.find(el => el.key === columnKey)
		if (target) {
			newColumnWidth < (target?.maxWidth ?? infinity) ? (target.width = newColumnWidth) : (target.width = target?.maxWidth!)
			setColumnWidth([...columnWidth])
		}
	}

	return (
		<Table rowHeight={30} rowsCount={rows.length} width={width} height={height} headerHeight={50} isColumnResizing={false} onColumnResizeEndCallback={onColumnResizeEndCallback}>
			{columns.map(el => (
				<Column
					key={el.key}
					width={(columnWidth.find(e => e.key === el.key) || { width: 0 })!.width}
					columnKey={el.key}
					isResizable={el.isResizable ?? true}
					header={el.headerRenderer ? el.headerRenderer({ columns, column: el }) : el.title}
				></Column>
			))}
			<Column header={<Cell>Col 1</Cell>} cell={<Cell>Column 1 static content</Cell>} width={200} />
			<Column header={<Cell>Col 2</Cell>} cell={<MyCustomCell mySpecialProp="column2" />} width={200} />
			<Column header={<Cell>Col 3</Cell>} cell={({ rowIndex, ...props }) => <Cell {...props}>Data for column 3: {rows[rowIndex]}</Cell>} width={200} />
		</Table>
	)
}
