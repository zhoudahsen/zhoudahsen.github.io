// Aurora 主题脚本
document.addEventListener('DOMContentLoaded', function() {
  // 视频背景随机切换
  const defaultVideoSources = [
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ];
  const bgVideo = document.getElementById('bgVideo');
  if (bgVideo) {
    const customVideo = window.THEME_CONFIG && window.THEME_CONFIG.videoBg;
    let videoSrc;
    if (customVideo) {
      // 优先用固定视频
      videoSrc = customVideo;
    } else {
      // 从随机列表选
      const listStr = window.THEME_CONFIG && window.THEME_CONFIG.videoList;
      const customList = listStr ? listStr.split(',').map(s => s.trim()).filter(s => s) : [];
      const sources = customList.length > 0 ? customList : defaultVideoSources;
      videoSrc = sources[Math.floor(Math.random() * sources.length)];
    }
    bgVideo.querySelector('source').src = videoSrc;
    bgVideo.load();
  }

  // 导航栏滚动效果
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;
  
  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      navbar.style.background = 'rgba(15, 15, 26, 0.9)';
    } else {
      navbar.style.background = 'rgba(15, 15, 26, 0.7)';
    }
    
    lastScroll = currentScroll;
  });

  // 图片点击放大
  const images = document.querySelectorAll('.post-content img');
  images.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function() {
      window.open(this.src, '_blank');
    });
  });

  // ===== 网盘下载按钮：点击时自动复制提取码 =====
  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // 非安全上下文（http）回退方案
    return new Promise(function (resolve, reject) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('copy failed'));
      } catch (err) {
        reject(err);
      }
    });
  }

  function showCopyToast(message) {
    let toast = document.getElementById('copy-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'copy-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove('show');
    }, 1800);
  }

  // 从 "提取码: 1234" 这类文本里剥出纯提取码
  function extractCode(text) {
    let code = (text || '').trim();
    for (let i = 0; i < 4; i++) {
      const next = code.replace(/^(提取码|密码|访问码|提取密码|网盘密码)\s*[:：]?\s*/, '');
      if (next === code) break;
      code = next;
    }
    return code.trim();
  }

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.pan-button');
    if (!btn) return;

    const card = btn.closest('.pan-link-card');
    if (!card) return;

    const codeEl = card.querySelector('.pan-code');
    if (!codeEl) return;

    const code = extractCode(codeEl.textContent);
    if (!code) return;

    copyToClipboard(code)
      .then(function () {
        const originLabel = btn.textContent;
        btn.textContent = '已复制';
        btn.classList.add('copied');
        clearTimeout(btn._copyTimer);
        btn._copyTimer = setTimeout(function () {
          btn.textContent = originLabel || '下载';
          btn.classList.remove('copied');
        }, 1600);
        showCopyToast('提取码已复制：' + code);
      })
      .catch(function () {
        showCopyToast('复制失败，请手动复制：' + code);
      });
  });
});
