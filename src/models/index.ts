import dva, { Router, RouterAPI } from 'dva'
import createLoading from 'dva-loading'
import global from './global'
import router from '../router'
import { createBrowserHistory as createHistory } from 'history'

// const createHistory = require("history").createBrowserHistory

const app = dva({
	history: createHistory(),
})

app.use(createLoading())

app.model(global)

app.router(router as Router)

app.start('#root')
