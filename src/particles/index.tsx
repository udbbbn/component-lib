import React, { useEffect, ChangeEvent } from 'react';
import Particles, { MouseParticles } from './particles';
import './index.scss'

export default function Particle() {
  
  const circles: Particles[] = [];
  let canvas: HTMLCanvasElement | null;
  let ctx: CanvasRenderingContext2D | null;
  let w: number;
  let h: number;
  let mouseParticles: MouseParticles | null;

  useEffect(() => {
    canvasInit();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function canvasInit() {
    canvas = document.querySelector('#canvas');
    if (canvas) {
      ctx = (canvas as HTMLCanvasElement).getContext('2d');
      w = canvas!.width = canvas!.offsetWidth;
      h = canvas!.height = canvas!.offsetHeight;
      mouseParticles = new MouseParticles(0, 0);
      canvas.onmousemove = mouseMove;
      canvas.onmouseout = mouseOut;
      window.onresize = canvasResize;
      circlesInit(getCirclesLength(), w, h);
    }
  }

  function getCirclesLength() {
    const { width } = canvas!.getBoundingClientRect();
    return width / 25
  }

  function circlesInit(num: number, w: number, h: number) {
		for (let i = 0; i < num; i++) {
			circles.push(new Particles(Math.random() * w, Math.random() * h, w, h));
    }
    draw();
  }

  function draw() {
    ctx?.clearRect(0, 0, w, h);
    let attract = false;
    if (mouseParticles?.x) {
      mouseParticles.resetLineNumber();
      mouseParticles?.drawCircle(ctx as CanvasRenderingContext2D);
      for (let i = 0; i < circles.length; i++) {
        attract = mouseParticles!.drawLine(ctx as CanvasRenderingContext2D, circles[i])
        circles[i].move(attract, mouseParticles!.x, mouseParticles!.y);
        circles[i].drawCircle(ctx as CanvasRenderingContext2D);
        for (let j = i+1; j < circles.length; j++) {
          circles[i].drawLine(ctx as CanvasRenderingContext2D, circles[j])
        }
      }
    }
    for(let i = 0; i < circles.length; i++) {
      circles[i].move(attract, mouseParticles!.x, mouseParticles!.y);
      circles[i].drawCircle(ctx as CanvasRenderingContext2D);
      for (let j = i+1; j < circles.length; j++) {
        circles[i].drawLine(ctx as CanvasRenderingContext2D, circles[j])
      }
    }
    requestAnimationFrame(draw);
  }

  function mouseMove(e: MouseEvent) {
    const { clientX, clientY } = e;
    const { x, y } = getMousePosition(canvas as HTMLCanvasElement, clientX, clientY);
    mouseParticles!.setPosition(x, y);
  }

  function mouseOut(e: MouseEvent) {
    mouseParticles!.setPosition(0, 0);
  }

  function canvasResize() {
    const { width, height } = canvas!.getBoundingClientRect();
    canvas!.width = width;
    canvas!.height = height;
    w = canvas!.width = canvas!.offsetWidth;
    h = canvas!.height = canvas!.offsetHeight;
  }

  /**
   * 获取鼠标在 canvas 内的坐标
   */
  function getMousePosition(
    canvas: HTMLCanvasElement, 
    x: number, 
    y: number
  ) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: x - rect.left * ( canvas.width / rect.width ),
      y: y - rect.top * ( canvas.height / rect.height )
    }
  }

  return (
    <div>
      <canvas id="canvas"></canvas>
    </div>
  )
}