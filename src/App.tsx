import React, { useState, useEffect } from 'react'
import logo from './logo.svg'
import './App.css'

import Bullet from './bullet'
import Particle from './particles'
import VirtualList, { REFRESH_STATUS } from './virtual-list'
// import { withRouter } from 'dva/router';

import TableComponent from './fix-data-table'
import { columns } from './fix-data-table/columns'

function App(props: any): JSX.Element {
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

	return (
		<div className="App">
			{props.children}
			<div id="subapp-container"></div>
		</div>
	)
}

export default App
