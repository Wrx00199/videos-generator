shot(0, 2, (lt, t) => {
  ctx.save(); cam(1.0, 540, 1250); galley(t);
  crate(370, 1470, 200, 110);
  const o = { x: 470, y: 1474, shadow: 0, eye: 'happy', lx: .6, mouth: 'smile', tilt: Math.sin(t * 2.2) * .05, aL: [-.3, .3] };
  stirPot('tiao', o, 620, 1316, .55, t); steam(620, 1250, t, 3, .6);
  drawChar('cap', { x: 200, y: 1680, eye: 'dot', lx: .7, mouth: 'smile', aL: [-.3, .3], aR: [.5, -1.6] }, t);
  const b = { x: 880, y: 1720, f: -1, eye: 'happy', mouth: 'grin', mo: .5 }; holdBowl(b, 1, t); drawChar('mar1', b, t);
  ctx.restore();
});
shot(2, 4, (lt, t) => { SKYK = 'dia'; ctx.save(); cam(1.0, 540, 1250); deck(PAL.day, t, { mast: 900 });
  barrelBack(180, 1640, 1); barrelFront(180, 1640); parrot(180, 1372, .85, { eye: 'happy' });
  drawChar('mar2', { x: 900, y: 1640, f: -1, eye: 'dot', mouth: 'smile', aR: [2.7, .3] }, t);
  drawChar('cap', { x: 470, y: 1650, eye: 'dot', lx: -.5, mouth: 'smile', aL: [-.3, .3], aR: [.5, -1.6] }, t);
  drawChar('tiao', { x: 680, y: 1720, f: -1, eye: 'happy', mouth: 'smile', hR: { k: 'ladle', a: 2.4 }, aR: { ik: [30, -90] }, aL: { ik: [-30, -90] } }, t);
  drawChar('mar1', { x: 330, y: 1790, eye: 'happy', mouth: 'grin', mo: .5 }, t);
  ctx.restore(); });
