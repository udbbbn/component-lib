import React, { useState } from 'react'
import classNames from 'classnames'
import style from './index.module.scss'

export enum REFRESH_STATUS {
	idle = 2, // 刷新完成
	ongoing = 1, // 刷新中
	pending = 0, // 等待刷新
}

interface VirtualListState {
	list: any[]
	visibleList: any[]
	viewHeight: number
	listTransY: number
	touchMoveDistance: number
	refreshSwitch: REFRESH_STATUS // 0 未刷新 1 正在刷新 2 刷新成功
}

interface ListSource {
	key: string | number
	[x: string]: any
}

interface VirtualListProps {
	itemHeight: number // 根据实际项目情况 预估单个 item 的高度
	listHeight: number // list 容器高度
	bufferSize: number // 预渲染 item 数量 建议为双数可均匀分配至当前可视窗口的上下位
	listSource: ListSource[] // 数据源
	sourceValueKey: string // 渲染 listSource时 key 的取值
	pullDownRefresh: boolean // 是否开启下拉刷新
	refreshCallBack: (() => void) | null // 下拉刷新回调
	refreshStatus: REFRESH_STATUS // 下拉刷新时会把执行权交给 业务 业务代码执行完需要将当前变量修改 解除loading态
}

const PULL_DOWN_WRAPPER_HEIGHT = 50 // 下拉刷新的 ui 高度
const RESISTANCE = 0.2 // 拖动的阻力

export default class VirtualList extends React.Component<VirtualListProps, VirtualListState> {
	static defaultProps: VirtualListProps = {
		itemHeight: 45,
		listHeight: 400,
		bufferSize: 6,
		listSource: Array(100)
			.fill(1)
			.map((el, i) => ({ key: i, value: i })),
		sourceValueKey: 'value',
		pullDownRefresh: true,
		refreshStatus: 0,
		refreshCallBack: null,
	}

	listView = React.createRef<HTMLDivElement>()
	startIdx = 0
	endIdx = 0
	touchStartPos: { x: number; y: number } = { x: 0, y: 0 }
	touchEndPos: { x: number; y: number } = { x: 0, y: 0 }
	currentScrollTop = 0

	state: VirtualListState = {
		list: [],
		visibleList: [],
		viewHeight: 0,
		listTransY: 0,
		touchMoveDistance: 0,
		refreshSwitch: 0,
	}

	componentDidMount(): void {
		this.initList()
	}

	static getDerivedStateFromProps(props: VirtualListProps, state: VirtualListState): Record<string, any> | null {
		if (props.refreshStatus !== state.refreshSwitch) {
			let temp: Partial<VirtualListState> = {
				refreshSwitch: props.refreshStatus,
			}
			// 从 刷新成功 状态重置到 未刷新 状态
			if (props.refreshStatus === REFRESH_STATUS.pending && state.refreshSwitch === REFRESH_STATUS.idle) {
				temp = { ...temp, touchMoveDistance: 0, listTransY: 0 }
			}
			return temp
		}
		return null
	}

	initList(): void {
		const { listSource, pullDownRefresh } = this.props
		this.setState(
			{
				list: listSource,
				viewHeight: this.getViewHeight(listSource.length),
			},
			() => this.updateVisibleList()
		)
		this.listView.current!.addEventListener('scroll', this.scroll)
		if (pullDownRefresh) {
			this.listView.current!.addEventListener('touchstart', this.touchStart)
			this.listView.current!.addEventListener('touchmove', this.touchMove)
			this.listView.current!.addEventListener('touchend', this.touchEnd)
		}
	}

	// 更新视图
	updateVisibleList(scrollTop = 0): void {
		const { itemHeight, listHeight, bufferSize } = this.props
		const { list } = this.state
		const visibleCount = Math.ceil(listHeight / itemHeight)
		this.startIdx = Math.floor(scrollTop / itemHeight)
		this.endIdx = this.startIdx + visibleCount
		let offsetStart = 0,
			offsetEnd = 0
		// 处理预渲染
		if (this.startIdx === 0) {
			offsetEnd = bufferSize
		} else if (this.endIdx === list.length - 1) {
			// 索引从 0 开始 0 - 99
			// 因 slice(start end) 中 end 不包含 slice 中 所以 endIdx = 99 是不包含 99 这个值的 所以 offsetStart 要 + 1
			// offsetEnd 为 1
			offsetStart = -bufferSize + 1
			offsetEnd = 1
		} else {
			const offsetMiddle = Math.floor(bufferSize / 2)
			if (this.startIdx > offsetMiddle && list.length >= this.endIdx + offsetMiddle) {
				offsetStart = -offsetMiddle
				offsetEnd = bufferSize - offsetMiddle
			} else if (this.startIdx <= offsetMiddle) {
				offsetStart = -this.startIdx
				offsetEnd = bufferSize + offsetStart
			} else {
				// (list.length <= this.endIdx + offsetMiddle)
				offsetEnd = list.length - this.endIdx
				offsetStart = -(bufferSize - offsetEnd)
			}
		}
		const visibleList = this.state.list.slice(this.startIdx + offsetStart, this.endIdx + offsetEnd)
		// NOTE 这里需要注意的点是 translate3d 中的 y 值 偏移量也要参与计算 将预渲染的元素不显示在可视窗口内
		// 如 startIdx 为 10 那就是以 10 计算位移量 而实际渲染时会 unshift(形如) bufferSize 至 10 的前面
		const listTransY = (this.startIdx + offsetStart) * itemHeight
		this.setState({ visibleList, listTransY })
	}

	// 获取容器高度
	getViewHeight(listLength: number): number {
		const { itemHeight } = this.props
		return listLength * itemHeight
	}

	scroll = (e: Event): void => {
		const { scrollTop } = e.target as HTMLDivElement
		this.currentScrollTop = scrollTop
		this.updateVisibleList(scrollTop)
	}

	// touch 事件
	touchStart = (e: TouchEvent): void => {
		const { touches } = e
		const { clientX: x, clientY: y } = touches[0]
		this.touchStartPos = { x, y }
	}

	touchMove = (e: TouchEvent): void => {
		const { touches } = e
		const { clientY } = touches[0]
		const { y } = this.touchStartPos
		const moveDistance = Math.abs(clientY - y) * RESISTANCE
		if (this.currentScrollTop === 0) {
			const temp = moveDistance > PULL_DOWN_WRAPPER_HEIGHT ? PULL_DOWN_WRAPPER_HEIGHT : moveDistance
			this.setState({
				touchMoveDistance: temp,
				listTransY: temp,
			})
		}
	}

	touchEnd = (): void => {
		const { touchMoveDistance } = this.state
		if (this.currentScrollTop === 0) {
			if (touchMoveDistance === PULL_DOWN_WRAPPER_HEIGHT) {
				(this.props.refreshCallBack as () => void)()
			} else {
				this.setState({
					touchMoveDistance: 0,
					listTransY: 0,
					refreshSwitch: REFRESH_STATUS.pending,
				})
			}
		}
	}

	render(): JSX.Element {
		const { sourceValueKey, itemHeight } = this.props
		const { visibleList, viewHeight, listTransY, touchMoveDistance, refreshSwitch } = this.state
		return (
			<div className={style.list_view} ref={this.listView}>
				<div className={style.list_placeholder} style={{ height: `${viewHeight}px` }}></div>
				<div className={style.list_content} style={{ transform: `translate3d(0, ${listTransY}px, 0)` }}>
					<PullDownUi height={touchMoveDistance} refreshSwitch={refreshSwitch}></PullDownUi>
					{visibleList.map(el => (
						<div className={style.list_item} style={{ height: `${itemHeight}px` }} key={el.key}>
							{el[sourceValueKey]}
						</div>
					))}
				</div>
			</div>
		)
	}
}

interface PullDownProps {
	height: number
	refreshSwitch: number
}

function PullDownUi(props: PullDownProps) {
	const { height, refreshSwitch } = props

	return (
		<div className={style.pull_down} style={{ transform: `translate3d(0, ${-PULL_DOWN_WRAPPER_HEIGHT + height}px, 0)` }}>
			<div className={style.pull_wrapper}>
				{refreshSwitch === REFRESH_STATUS.idle ? (
					<div></div>
				) : (
					<div className={classNames(style.loading_gif, { [`${style.loading_animation}`]: refreshSwitch })} style={{ transform: `rotate(${height * 15}deg)` }}></div>
				)}
				<div>{refreshSwitch === REFRESH_STATUS.idle ? '刷新成功' : refreshSwitch === REFRESH_STATUS.ongoing ? '正在刷新...' : height < 50 ? '下拉刷新' : '松手刷新哦~'}</div>
			</div>
		</div>
	)
}
