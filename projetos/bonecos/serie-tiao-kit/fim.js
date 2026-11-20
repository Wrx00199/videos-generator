function renderAt(t) {
  t = C(t, 0, DUR - .001); TT = t; SKYK = null; SKYK2 = null; SKYM = 0;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  let s = SH_[SH_.length - 1]; for (const x of SH_) if (t >= x.a && t < x.b) { s = x; break; }
  ctx.save(); s.f(t - s.a, t, s.b - s.a); ctx.restore(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; vignette(.32);
}
window.__renderAt = renderAt;
const st = { t: 0 }; const tl = gsap.timeline({ paused: true });
tl.to(st, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => renderAt(st.t) }, 0);
window.__timelines = window.__timelines || {}; window.__timelines.main = tl;
window.addEventListener('hf-seek', e => renderAt(e.detail.time));
window.addEventListener('load', () => renderAt(st.t));
renderAt(0);
})();
