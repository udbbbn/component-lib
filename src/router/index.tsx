import React from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import { RouterAPI } from 'dva'
import { routerRedux, Router, Route, Switch } from 'dva/router'

import App from '../App'
import Particle from '../particles'
import Table from '../fix-data-table/demo'
import Bullet from '../bullet'
import VirtualList from '../virtual-list/demo'
import errorBoundary from '../error-boundary/demo'

// const { ConnectedRouter } = routerRedux;

function routerConfig({ history }: RouterAPI) {
	history.listen((location, action) => {
		console.log('history', location, action)
	})
	return (
		<ConfigProvider locale={zhCN}>
			<App>
				<Router history={history}>
					<Switch>
						<Route path="/" component={App} exact />
						<Route path="/particle" component={Particle} />
						<Route path="/table" component={Table} />
						<Route path="/bullet" component={Bullet} />
						<Route path="/virtualList" component={VirtualList} />
						<Route path="/errorBoundary" component={errorBoundary} />
					</Switch>
				</Router>
			</App>
		</ConfigProvider>
	)
}

export default routerConfig
