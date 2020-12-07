import React from 'react'
import { ColumnRenderValProps } from './types'

export const columns = [
	{
		className: 'text-overflow-ellipsis',
		title: '状态',
		dataIndex: 'status',
		key: 'status',
		width: 100,
		maxWidth: 200,
		minWidth: 10,
		render: (val: ColumnRenderValProps, r: Record<string, any>) => {
			return (
				<span>
					状态 {val} {r.status}{' '}
				</span>
			)
		},
	},
]
