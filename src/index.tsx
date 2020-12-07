import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
// 微前端
import { registerMicroApps, start } from 'qiankun'
import microApps from './micro-app'
import './models'

// ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()

registerMicroApps(microApps, {
	beforeLoad: [
		async app => {
			console.log('before load app.name====>>>>>', app.name)
		},
	],
	beforeMount: [
		async app => {
			console.log('[LifeCycle] before mount %c%s', 'color: green;', app.name)
		},
	],
	afterMount: [
		async app => {
			console.log('[LifeCycle] after mount %c%s', 'color: green;', app.name)
		},
	],
	afterUnmount: [
		async app => {
			console.log('[LifeCycle] after unmount %c%s', 'color: green;', app.name)
		},
	],
})

start()
