/* 详情页文字区底图：漩涡图自身随滚动/时间荡漾（水波扭曲），暗红遮罩叠于其上 */
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

  // 把漩涡底图载入离屏 canvas，逐行位移 → 图像本身荡漾
  var img = new Image();
  var off = document.createElement('canvas');
  var octx = off.getContext('2d');
  var imgReady = false;
  var ref = document.querySelector('.detail-bg img');
  img.onload = function(){
    off.width  = img.naturalWidth;
    off.height = img.naturalHeight;
    octx.drawImage(img, 0, 0);
    imgReady = true;
  };
  img.src = ref ? (ref.currentSrc || ref.src) : 'assets/swirl.jpg';

  var t = 0, lastY = window.scrollY || 0, vel = 0, rings = [];
  window.addEventListener('scroll', function(){
    var y = window.scrollY || 0;
    var d = y - lastY; lastY = y;
    vel += Math.abs(d);
    if(Math.abs(d) > 6 && rings.length < 10){
      rings.push({ x: Math.random() * W, y: Math.random() * H, r: 0, a: 0.5 });
    }
  }, { passive: true });

  function frame(){
    t += 0.016;
    vel *= 0.90;
    ctx.clearRect(0, 0, W, H);

    if(imgReady && off.width){
      var sy = window.scrollY || 0;
      // 滚动越快，水波振幅越大；相位由时间+滚动共同驱动 → 滚动时水波随之流动
      var amp = 5 + Math.min(vel * 0.5, 16);
      var pad = amp + 2;                       // 放大绘制，掩盖位移露边
      var step = 2;
      for(var y = 0; y < H; y += step){
        var ph = y * 0.018 + t * 1.1 + sy * 0.02;
        var dx = Math.sin(ph) * amp + Math.sin(y * 0.045 + t * 0.7) * amp * 0.4;
        var dy = Math.cos(y * 0.016 + t * 0.9 + sy * 0.015) * amp * 0.5;
        var so = (y / H) * off.height;          // 源图对应行
        // 整行横向位移 + 轻微纵向错位 → 图像如水波般起伏
        ctx.drawImage(off, 0, so, off.width, 1, dx - pad, y + dy, W + pad * 2, step + 1);
      }
    }

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
