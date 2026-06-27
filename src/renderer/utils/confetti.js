const COLORS = ['#4CAF50', '#FFC107', '#FF5722', '#2196F3', '#E91E63', '#9C27B0', '#00BCD4', '#FF9800'];

export function triggerConfetti(canvas, duration = 2500) {
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const particles = [];
  const count = Math.floor(150 + Math.random() * 150);
  let animId = null;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      w: 4 + Math.random() * 6,
      h: 4 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vy: 1 + Math.random() * 3,
      vx: -2 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotSpeed: -5 + Math.random() * 10,
      opacity: 1,
    });
  }

  const startTime = performance.now();

  function animate(time) {
    const elapsed = time - startTime;
    if (elapsed > duration) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (animId) cancelAnimationFrame(animId);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const fadeStart = duration * 0.8;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.rotation += p.rotSpeed;

      if (elapsed > fadeStart) {
        p.opacity = Math.max(0, 1 - (elapsed - fadeStart) / (duration - fadeStart));
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    animId = requestAnimationFrame(animate);
  }

  animId = requestAnimationFrame(animate);

  return () => {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}
