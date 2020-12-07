import { RegistrableApp } from 'qiankun/es/interfaces'

const microApps: RegistrableApp<any>[] = [
	{
		name: 'vue-app',
		entry: '//localhost:9090/',
		activeRule: '/sub-vue',
		container: '#subapp-container',
		props: {
			routerBase: '/sub-vue',
		},
	},
]

export default microApps
