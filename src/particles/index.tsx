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
  });

  function canvasInit() {
    canvas = document.querySelector('#canvas');
    if (canvas) {
      ctx = (canvas as HTMLCanvasElement).getContext('2d');
      w = canvas!.width = canvas!.offsetWidth;
      h = canvas!.height = canvas!.offsetHeight;
      mouseParticles = new MouseParticles(0, 0);
      canvas.onmousemove = mouseMove;
      canvas.onmouseout = mouseOut;
      circlesInit(100, w, h);
    }
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
      mouseParticles?.drawCircle(ctx as CanvasRenderingContext2D);
      for (let j = 0; j < circles.length; j++) {
        mouseParticles!.drawLine(ctx as CanvasRenderingContext2D, circles[j])
      }
      attract = true;
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