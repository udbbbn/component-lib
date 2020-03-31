

interface cssOpts {
  position: string,
  left: string,
  animationName: string,
  animationTimingFunction: string,
  animationDuration: string,
  [propName: string]: string
}

const defaultCss: cssOpts = {
  position: 'absolute',
  left: '0px',
  animationName: 'RightToLeft',
  animationTimingFunction: 'linear',
  animationDuration: '3s'
}


/**
 * 获取 css3 动画值
 * @param width 视频容器的 width 值
 */
const getKeyFrames: (width: number) => string = width => (
  `@keyframes RightToLeft {
    from {
      visibility: visible;
      transform: translateX(${width}px);
    }
    to {
      visibility: visible;
      transform: translateX(-100%);
    }
  }`
)

/**
 * 初始化弹幕动画
 * @param screen 视频容器
 * @param width 视频容器的 width 值
 */
const initDanmakuAnimate = (
  screen: HTMLElement | null, 
  width: number
): void => {
  if (!screen) return
  const style: HTMLStyleElement = document.createElement('style');
  document.head.appendChild(style);
  (style.sheet as CSSStyleSheet).insertRule(getKeyFrames(width), 0);
}

/**
 * 新建弹幕容器 使用 dom 对象方便处理高度以及后续的交叉观察器
 * @returns 返回 弹幕容器
 */
const getBulletContainer = (opts: { [propName: string]: string | Function }): HTMLElement => {
  const container = document.createElement('div');
  container.id = Math.random().toString(32);
  setStyle(container, defaultCss);
  return container
}

/**
 * 设置 html 元素的样式
 * @param target HTMLElement
 * @param css css样式对象
 */
const setStyle = (target: HTMLElement, css: {[propName: string]: string}): void  => {
  let i: any;
  for (i in css) {
    target.style[i] = css[i]
  }
}

/**
 * 节流函数
 * @param fn 被节流函数
 * @param timeout 间隔
 */
const throttle = function(fn: Function, timeout: number): Function {
  let lastTime = 0;
  return function () {
    let now = new Date().getTime();
    console.log(now, lastTime)
    if (now - lastTime > timeout) {
      console.log('throttle!!')
      fn.apply(null, arguments)
      lastTime = now;
    }
  }
}

export { initDanmakuAnimate, getBulletContainer, throttle }