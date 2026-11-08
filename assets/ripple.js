/* 详情页文字区底图之上的红色水波：随滚动荡漾流动 */
(function(){
  var cv = document.querySelector('.ripple');
  if(!cv) return;
  var ctx = cv.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;

  function size(){
    var r = cv.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    cv.width  = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener('resize', size);
  window.addEventListener('load', size);
  if(window.ResizeObserver){ try{ new ResizeObserver(size).observe(cv); }catch(e){} }

  var t = 0, lastY = window.scrollY || 0, vel = 0, rings = [];

  window.addEventListener('scroll', function(){
    var y = window.scrollY || 0;
    var d = y - lastY; lastY = y;
    vel += Math.abs(d);
    if(Math.abs(d) > 6 && rings.length < 10){
      rings.push({ x: Math.random() * W, y: Math.random() * H, r: 0, a: 0.55 });
    }
  }, { passive: true });

  function frame(){
    t += 0.016;
    vel *= 0.90;
    ctx.clearRect(0, 0, W, H);

    var sy = window.scrollY || 0;
    ctx.globalCompositeOperation = 'lighter';   // 红光叠加在暗色漩涡上

    var N = 6;                                   // 6 条红色水波线
    for(var i = 0; i < N; i++){
      var frac  = (i + 0.5) / N;
      // 垂直方向轻微浮动 + 随滚动位移（让水波"跟着动"）
      var baseY = frac * H + Math.sin(t * 0.6 + i) * 6 + Math.sin(sy * 0.02 + i) * 5;
      var amp   = 10 + (i % 3) * 4 + Math.min(vel * 0.4, 22);   // 快速滚动时振幅变大
      var freq  = 0.012 + (i % 3) * 0.003;
      // 相位由时间与 scrollY 共同驱动 → 滚动时水波随之流动
      var phase = t * (0.4 + (i % 3) * 0.2) + sy * 0.02 + i * 1.1;

      ctx.beginPath();
      for(var x = 0; x <= W; x += 5){
        var y = baseY
              + Math.sin(x * freq + phase) * amp
              + Math.sin(x * freq * 2.3 + phase * 1.6) * amp * 0.3;
        if(x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      var a = 0.10 + (i % 3) * 0.05;
      ctx.strokeStyle = 'rgba(226,32,42,' + a + ')';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';

    // 快速滚动时散开的同心涟漪
    for(var k = rings.length - 1; k >= 0; k--){
      var rg = rings[k];
      rg.r += 2.4 + vel * 0.05; rg.a -= 0.012;
      if(rg.a <= 0){ rings.splice(k, 1); continue; }
      ctx.beginPath();
      ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(226,32,42,' + rg.a + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
