import React from "react";
import ReactDOM from "react-dom";

import { initDanmakuAnimate, getBulletContainer, throttle, toString } from "./util";
import DanmakuUi from "./danmaku-ui";

/**
 * trackHeight 轨道行高
 * gap 发出的弹幕距离容器的像素
 */
interface OptionsBase { 
	trackHeight: number; 
	gap: string;
	comments: string[] | string;
}

interface Options extends Partial<OptionsBase> {}

type TrackStatus = 'idle' | 'pending';

interface EventBase {
	onMouseEnter: Function;
	onMouseLeave: Function;
	onMouseClick: Function;
	onStart: Function;
	onEnd: Function;
}

interface EventOpts extends Partial<EventBase> {}

interface CssOpts {}

interface BulletQueue {
	item: JSX.Element;
	container: HTMLElement;
}

const defalutOptions: Partial<Options> = {
	trackHeight: 50,
	gap: "10px",
};

export default class Danmaku {
	/**
	 * Creates an instance of Danmaku.
	 * @param {(HTMLElement | string)} el 容器 dom 元素 或 容器字符串
	 * @param {*} [opt={}] 可配置项
	 * @memberof Danmaku
	 */
	constructor(el: HTMLElement | string, opt: Partial<Options> = {}) {
		// 可配置项
		this.options = { ...this.options, ...opt };
		const { trackHeight } = this.options;
		let { comments } = this.options;
		// 初始化容器对象
		if (typeof el === "string") {
			this.target = document.querySelector(el);
			if (!this.target) {
				throw new Error("容器对象不存在");
			}
		} else if (el instanceof HTMLElement) {
			this.target = el;
		} else {
			throw new Error("容器对象必须是一个有效对象");
		}
		// 初始化轨道
		const { height, width } = this.target.getBoundingClientRect();
		this.tracks = Array(Math.floor(height / (trackHeight as number))).fill('idle');
		// 容器对象必须是 非 static 属性对象
		const { position } = getComputedStyle(this.target);
		if (position === "static") {
			this.target.style.position = "relative";
		}
		// 初始化初始弹幕
		if (comments) {
			if (toString(comments) === '[object String]') {
				comments = [(comments as string)];
			}
			if (toString(comments) === '[object Array]') {
				this.setComments(comments as string[]);
			}
		}
		// 初始化 css 动画
		initDanmakuAnimate(this.target, width);
		// 渲染预设数组
		this.mountComments();
	}
	options = defalutOptions;
	target: HTMLElement | null = null;
	tracks: TrackStatus[] = [];
	bullets: HTMLElement[] = [];
	queue: BulletQueue[] = [];

	/**
	 * 获取空闲轨道
	 * @memberof Danmaku
	 */
	getTrack(): number {
		const { tracks } = this;
		const readyIdxs: number[] = [];
		let idx = -1;
		tracks.map((status, idx) => status === "idle" && readyIdxs.push(idx));
		if (readyIdxs.length) {
			idx = Math.floor(Math.random() * readyIdxs.length);
		}
		if (idx !== -1) {
			this.tracks[readyIdxs[idx]] = "pending";
		}
		return readyIdxs[idx];
	}
	
	/**
	 * 获取空闲轨道
	 */
	getTracks(): number[] {
		const { tracks } = this;
		return tracks.filter(status => status === 'idle').reduce<number[]>((t, c, i) => ([...t, i]), [])
	}
  
  /**
   * 设置轨道空闲状态
   * @param {number} trackIdx
   * @memberof Danmaku
   */
  setTrackIdle(trackIdx: number): void {
		this.tracks[trackIdx] = 'idle';
	}

  /**
   * 设置轨道繁忙状态
   * @param {number} trackIdx
   * @memberof Danmaku
   */
  setTrackPending(trackIdx: number): void {
    this.tracks[trackIdx] = 'pending'
	}

	/**
	 * 设置预设弹幕
	 * @param comments[] 预设弹幕数组 目前为字符串
	 */
	setComments(comments: string[]): void {
		comments.map(el => {
			const container = getBulletContainer({});
			this.queue.push({ item: <DanmakuUi msg={el}></DanmakuUi>, container });
			this.bullets.push(container);
		})
	}

	/**
	 * 渲染预设数组
	 */
	mountComments(): void {
		const { item: i, container: c } = this.queue.shift() as BulletQueue;
		const idx = this.getTrack();
		if (this.queue.length) {
			setTimeout(() => { this.mountComments() });
		}
		this.render(i, c, idx);
		this.setEventListener(c)
	}

	/**
	 * 发布弹幕
	 * @param {JSX.Element} item 弹幕的 jsx 元素
	 * @param {EventOpts} [opts={}] 事件对象
	 * @memberof Danmaku
	 */
	push = throttle((item: JSX.Element, opts: EventOpts = {}): void => {
		const container = getBulletContainer({});
		const idx = this.getTrack();
		if (idx !== -1) { 
			this.render(item, container, idx);
		} else {
			this.queue.push({ item, container });
		}
		// 储存弹幕 在全局暂停时 可进行操作
		this.bullets.push(container);
		// 设置事件监听
		this.setEventListener(container, opts)
	}, 300)

	/**
	 * 设置事件监听
	 * @param container 弹幕容器
	 * @param opts EventOpts 对象
	 */
	setEventListener(container: HTMLElement, opts: EventOpts = {}): void {
		const { onStart, onEnd, onMouseEnter, onMouseLeave, onMouseClick } = opts;

		// 动画开始
		container.addEventListener("animationstart", () => {
			if (onStart) {
				(onStart as Function).call(container, this);
			}
		});
		// 动画结束
		container.addEventListener("animationend", () => {
			if (onEnd) {
				(onEnd as Function).call(container, this);
			}
			this.bullets = this.bullets.filter(el => el.id !== container.id);
			// 这里如果直接从 dom 删除 而不调用 unmountComponentAtNode React 将不知道该组件是否需要被卸载 不会触发钩子函数 同时 阻止组件树被回收
			ReactDOM.unmountComponentAtNode(container);
			container.remove();
		});
		// 鼠标悬停元素事件
		onMouseEnter &&
			container.addEventListener("mouseenter", e => {
				container.style.animationPlayState = "paused";
				onMouseEnter.call(container, e, this);
			});
		onMouseLeave &&
			container.addEventListener("mouseleave", e => {
				container.style.animationPlayState = "running";
				onMouseLeave.call(container, e, this);
			});
		// 鼠标点击事件
		onMouseClick &&
			container.addEventListener("click", e => {
				e.stopPropagation();
				onMouseClick.call(container, e, this);
			});
	}

	/**
	 * 将弹幕渲染进容器中
	 * @param {JSX.Element} item 弹幕的 jsx 元素
	 * @param {HTMLElement} container 弹幕容器 非屏幕容器
	 * @param {number} trackIdx 轨道索引
	 * @memberof Danmaku
	 */
	render(item: JSX.Element, container: HTMLElement, trackIdx: number): void {
		this.target?.appendChild(container);
		const { trackHeight } = this.options;
		const bulletTop = trackIdx * (trackHeight as number);
		container.dataset.trackIdx = `${trackIdx}`;

		const { gap } = this.options;
    // 设置交叉观察器中的 可选项
		const intersectionOpt = {
			root: this.target,
			rootMargin: `0px ${gap} 0px 0px`,
			threshold: 1.0,
		};

		ReactDOM.render(item, container, () => {
			container.style.top = `${bulletTop}px`;
			// 创建监听对象
			new IntersectionObserver(entries => {
				entries.map(entry => {
					const { target, intersectionRatio }: { target: Element; intersectionRatio: number } = entry;
					// 确保当前弹幕在容器中完全可见
					if (intersectionRatio >= 1) {
						const curIdx = Number((target as HTMLElement).dataset.trackIdx);
						if (this.queue.length) {
							// 将队列中 未发送的弹幕取出并发送
							const { item: i, container: c } = this.queue.shift() as BulletQueue;
							this.render(i, c, curIdx);
						} else {
							// 直接将当前轨道状态置空闲
							this.setTrackIdle(curIdx)
						}
          }
          return 0
				});
			}, intersectionOpt).observe(container);
		});
	}
}

export { DanmakuUi };
