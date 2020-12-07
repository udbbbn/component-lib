import React, { useState, useEffect } from 'react'
import VirtualList, { REFRESH_STATUS } from '../index'

export default function VirtualListDemo(props: any): JSX.Element {
	const [refreshStatus, setRefreshStatus] = useState<REFRESH_STATUS>(REFRESH_STATUS.pending)

	function virtualListRefresh() {
		setRefreshStatus(REFRESH_STATUS.ongoing)
		setTimeout(() => {
			setRefreshStatus(REFRESH_STATUS.idle)
			setTimeout(() => {
				setRefreshStatus(REFRESH_STATUS.pending)
			}, 500)
		}, 1500)
	}
	console.log(props)

	return <VirtualList refreshCallBack={virtualListRefresh} refreshStatus={refreshStatus}></VirtualList>
}
