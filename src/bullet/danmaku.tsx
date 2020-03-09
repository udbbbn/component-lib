import React from 'react'
import ReactDOM from 'react-dom'

import { initDanmakuAnimate, getBulletContainer } from './util'
import DanmakuUi from './danmaku-ui'


interface options {
  trackHeight: number,
  gap: string,
}

interface eventOpts {
  onMouseEnter?: Function,
  onMouseLeave?: Function,
  onMouseClick?: Function,
  onStart?: Function,
  onEnd?: Function
}

interface cssOpts {

}

const defalutOptions: options = {
  trackHeight: 50,
  gap: '10px',
}

export default class Danmaku {
  constructor(el: HTMLElement | string, opt = {}) {
    // 可配置项
    this.options = {...this.options, ...opt};
    const { trackHeight } = this.options;
    // 初始化容器对象
    if (typeof el === 'string') {
      this.target = document.querySelector(el);
      if (!this.target) {
        throw new Error('容器对象不存在')
      }
    } else if (el instanceof HTMLElement) {
      this.target = el;
    } else {
      throw new Error('容器对象必须是一个有效对象')
    };
    // 初始化轨道
    const { height, width } = this.target.getBoundingClientRect();
    this.tracks = Array(Math.floor(height / trackHeight)).fill('idle');
    // 容器对象必须是 非 static 属性对象
    const { position } = getComputedStyle(this.target);
    if (position === 'static') {
      this.target.style.position = 'relative';
    }
    // 初始化 css 动画
    initDanmakuAnimate(this.target, width);
  }
  options = defalutOptions
  target: HTMLElement | null = null
  tracks: string[] = []
  bullets: HTMLElement[] = []
  queue: JSX.Element[] = []

  /**
   * 获取空闲轨道
   * @memberof Danmaku
   */
  getTrack (): number {
    const { tracks } = this;
    const readyIdxs = [];
    let idx = -1;
    tracks.map((status, idx) => status === 'idle' && readyIdxs.push(idx))
    if (readyIdxs.length) {
      idx = Math.floor(Math.random() * readyIdxs.length)
    }
    return idx
  }

  push(
    item: JSX.Element,
    opts: eventOpts = {}
  ) {
    const idx = this.getTrack();
    const container = getBulletContainer({});
    this.render(item, container, idx);
    // 储存弹幕 在全局暂停时 可进行操作
    this.bullets.push(container);

    const options = { ...this.options, ...opts };
    const { onStart, onEnd, onMouseEnter, onMouseLeave, onMouseClick } = options;

    // 动画开始
    container.addEventListener('animationstart', () => {
      if (onStart) {
        (onStart as Function).call(container, this)
      }
    })
    // 动画结束
    container.addEventListener('animationend', () => {
      if (onEnd) {
        (onEnd as Function).call(container, this)
      };
      this.bullets = this.bullets.filter(el => el.id !== container.id);
      // 这里如果直接从 dom 删除 而不调用 unmountComponentAtNode React 将不知道该组件是否需要被卸载 不会触发钩子函数 同时 阻止组件树被回收
      ReactDOM.unmountComponentAtNode(container);
      container.remove();
    })
    // 鼠标悬停元素事件
    onMouseEnter && container.addEventListener('mouseenter', (e) => {
      container.style.animationPlayState = 'paused';
      onMouseEnter.call(container, e, this)
    });
    onMouseLeave && container.addEventListener('mouseleave', (e) => {
      container.style.animationPlayState = 'running';
      onMouseLeave.call(container, e, this);
    })
    // 鼠标点击事件
    onMouseClick && container.addEventListener('click', (e) => {
      e.stopPropagation();
      onMouseClick.call(container, e, this);
    })
  }

  render(item: JSX.Element, container: HTMLElement, trackIdx: number) {
    this.target?.appendChild(container);
    const { trackHeight } = this.options;
    const bulletTop = trackIdx * trackHeight;
    container.dataset.trackIdx = `${trackIdx}`;
    this.tracks[trackIdx] = 'pending';

    const { gap } = this.options;

    const intersectionOpt = {
      root: this.target,
      rootMargin: `0px ${gap} 0px 0px`,
      threshold: 1.0
    }

    ReactDOM.render(item, container, () => {
      container.style.top = `${bulletTop}px`
      // 创建监听对象
      new IntersectionObserver((entries) => {
          entries.map(entry => {
            console.log(entry)
          const { target, intersectionRatio }: { target: Element, intersectionRatio: number} = entry;
          console.log(intersectionRatio)
          // console.log('current target', target);
          if (intersectionRatio >= 1) {
            console.log(target)
            console.log((target as HTMLElement).dataset.trackIdx)
            this.tracks[Number((target as HTMLElement).dataset.trackIdx)] = 'idle';
          }
        })
      }, intersectionOpt).observe(container);
    })
  }
}

export { DanmakuUi }