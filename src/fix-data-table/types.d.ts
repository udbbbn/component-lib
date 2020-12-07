export type ColumnRenderValProps = string | number | Record<string, any>

export type TableColumns<T> = {
	width: number // 宽度
	title: string // 标题
	className?: string // 样式名
	isResizable?: boolean // 是否允许拖动
	minWidth?: number // 最小宽度
	maxWidth?: number // 最大宽度

	key: string // 唯一列标示
	dataIndex?: string // 作为单列数据的 Key | 继承于 react-base-table
	headerRenderer?: ({ columns, column }: { columns: TableColumns<T>[]; column: TableColumns<T> }) => JSX.Element // 自定义 Title | 继承于 react-base-table
	render: (val: ColumnRenderValProps, record: T, index: number) => JSX.Element // 渲染函数
}

export type ColumnWidth = {
	key: string
	width: number
	minWidth?: number
	maxWidth?: number
}

export interface TableProps<T> {
	columns: TableColumns<T>[] // 表头数组
	rowHeight?: number // 行高
}
