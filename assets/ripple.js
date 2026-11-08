/* 详情页水波：黑红漩涡底图之上，随滚动流动的红色水波 */
(function(){
  var cv = document.querySelector('.ripple');
  if(!cv) return;
  var ctx = cv.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;

  function size(){
    var r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width  = Math.max(1, Math.round(W * dpr));
    cv.height = Math.max(1, Math.round(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener('resize', size);

  var t = 0, lastY = window.scrollY || 0, vel = 0, rings = [];

  window.addEventListener('scroll', function(){
    var y = window.scrollY || 0;
    var d = y - lastY; lastY = y;
    vel += Math.abs(d);
    if(Math.abs(d) > 6 && rings.length < 9){
      rings.push({ x: Math.random() * W, y: Math.random() * H, r: 0, a: 0.5 });
    }
  }, { passive: true });

  function frame(){
    t += 0.016;
    vel *= 0.90;
    ctx.clearRect(0, 0, W, H);

    // 流动的红水层：相位由 scrollY 驱动 → 滚动时水波随之荡漾
    var sy = window.scrollY || 0;
    var layers = 3;
    for(var l = 0; l < layers; l++){
      var amp   = 8 + l * 5 + Math.min(vel * 0.5, 26);
      var yBase = H * (0.30 + l * 0.22);
      var freq  = 0.010 + l * 0.004;
      var phase = t * (0.5 + l * 0.25) + sy * 0.012 + l * 1.3;
      ctx.beginPath();
      ctx.moveTo(0, yBase);
      for(var x = 0; x <= W; x += 6){
        var y = yBase
              + Math.sin(x * freq + phase) * amp
              + Math.sin(x * freq * 2.4 + phase * 1.7) * amp * 0.35;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      var g = ctx.createLinearGradient(0, yBase - amp, 0, H);
      g.addColorStop(0, 'rgba(210,28,38,0)');
      g.addColorStop(1, 'rgba(190,22,32,' + (0.05 + l * 0.025) + ')');
      ctx.fillStyle = g; ctx.fill();
    }

    // 快速滚动时散开的同心涟漪
    for(var i = rings.length - 1; i >= 0; i--){
      var rg = rings[i];
      rg.r += 2.2 + vel * 0.05; rg.a -= 0.012;
      if(rg.a <= 0){ rings.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(224,26,36,' + rg.a + ')';
      ctx.lineWidth = 1.2; ctx.stroke();
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
