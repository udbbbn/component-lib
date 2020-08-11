interface ParticlesState {
  x: number // x 坐标
  y: number // y 坐标
  r: number // r 半径
  mx: number // mx x轴 移动的距离
  my: number // my y轴 移动的距离
  canvasW: number // canvas 的宽度
  canvasH: number // canvas 的高度
  lineMaxDistance: number; // 连线距离最大限制
  lineMinDistance: number; // 连线距离最小限制
}

// 基础粒子对象
class Particles implements ParticlesState {
  x: number
  y: number
  canvasW: number
  canvasH: number
  r = Math.random() * 10 + 1;
  mx = Math.random() * 2 - 1;
  my = Math.random() * 2 - 1;
  lineMaxDistance = 150;
  lineMinDistance = 100;

  constructor(
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    this.x = x;
    this.y = y;
    this.canvasW = w;
    this.canvasH = h;
  }

  /**
   * 绘制圆
   * @param ctx CanvasRenderingContext2D 2d 画笔
   */
  drawCircle(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 360);
    ctx.fillStyle = '#eee';
    ctx.fill();
  }

  /**
   * 绘制线
   * @param ctx CanvasRenderingContext2D 2d 画笔
   * @param nextCircle Particles
   */
  drawLine(ctx: CanvasRenderingContext2D, nextCircle: Particles) {
    // 两个圆点之间的距离
    const distance = Math.sqrt(Math.pow(this.x - nextCircle.x, 2) + Math.pow(this.y - nextCircle.y, 2));
    if (distance < this.lineMaxDistance) {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(nextCircle.x, nextCircle.y);
      ctx.closePath();
      ctx.strokeStyle = '#eee';
      ctx.stroke();
    }
  }

  /**
   * 粒子圆点移动 若 鼠标 存在 向鼠标靠近
   * @param ifMouse 鼠标圆点是否存在
   */
  move(
    ifMouse: boolean,
    mouseX: number,
    mouseY: number
  ) {
    if (ifMouse) {
      const distance = Math.sqrt(Math.pow(this.x - mouseX, 2) + Math.pow(this.y - mouseY, 2));
      // 直接修改 x y 坐标 形成加速效果
      if (distance >= this.lineMinDistance && distance <= this.lineMaxDistance) {
        this.x += (mouseX - this.x) / 20;
        this.y += (mouseY - this.y) / 20;
      }
    } else {
      // 判断是否在容器内 是则继续执行 反之位移取反
      this.mx = (this.x < this.canvasW && this.x > 0) ? this.mx : (-this.mx);
      this.my = (this.y < this.canvasH && this.y > 0) ? this.my : (-this.my);
    }
    // 此处的默认移动移动 在鼠标悬停时可造成抖动效果
    this.x += this.mx / 2;
    this.y += this.my / 2;
  }

}

interface MouseParticlesState {
  x: number;
  y: number;
  r: number;
  maxLineNumber: number; // 最多连线数量
  lineNumber: number; // 当前连线数量
  lineMaxDistance: number; // 连线距离限制
}

// 基于鼠标的粒子对象
class MouseParticles implements MouseParticlesState {
  x: number;
  y: number;
  r = 8;
  maxLineNumber = 10;
  lineNumber = 0;
  lineMaxDistance = 150;

  constructor(
    x: number,
    y: number,
    maxLineNumber?: number
  ) {
    this.x = x;
    this.y = y;
    maxLineNumber && (this.maxLineNumber = maxLineNumber);
  }

  /**
   * 绘制圆
   * @param ctx 2d 画笔
   */
  drawCircle(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 360);
    ctx.fillStyle = '#eee';
    ctx.fill();
  }

  /**
   * 绘制线
   * @param ctx CanvasRenderingContext2D 2d 画笔
   * @param nextCircle Particles
   */
  drawLine(ctx: CanvasRenderingContext2D, nextCircle: Particles): boolean {
    // 两个圆点之间的距离
    const distance = Math.sqrt(Math.pow(this.x - nextCircle.x, 2) + Math.pow(this.y - nextCircle.y, 2));
    if (distance < this.lineMaxDistance && this.lineNumber < this.maxLineNumber) {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(nextCircle.x, nextCircle.y);
      ctx.closePath();
      ctx.strokeStyle = '#eee';
      ctx.stroke();
      this.lineNumber += 1;
    }
    return this.lineNumber < this.maxLineNumber
  }

  resetLineNumber() {
    this.lineNumber = 0;
  }

  setPosition(
    x: number,
    y: number
  ) {
    this.x = x;
    this.y = y;
  }
}

export default Particles

export {
  MouseParticles
}