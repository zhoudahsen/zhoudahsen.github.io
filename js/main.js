// Aurora 主题脚本
document.addEventListener('DOMContentLoaded', function() {
  // 视频背景随机切换
  const defaultVideoSources = [
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ];

  // 判断是否移动端设备
  function isMobileDevice() {
    const ua = navigator.userAgent || '';
    if (/Android|iPhone|iPod|Mobile|HarmonyOS|MicroMessenger|Windows Phone/i.test(ua)) return true;
    // iPadOS 13+ 的 UA 伪装成桌面版 Mac，用触点数兜底识别
    if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;
    return false;
  }

  const bgVideo = document.getElementById('bgVideo');
  if (bgVideo) {
    const conf = window.THEME_CONFIG || {};
    const customVideo = conf.videoBg;
    let videoSrc;
    if (customVideo) {
      // 1. 后台设置了固定视频，优先使用
      videoSrc = customVideo;
    } else {
      // 2. 后台手填的随机列表，支持 m: / 移动: 前缀区分移动端
      const listStr = conf.videoList;
      const rawList = listStr ? listStr.split(',').map(s => s.trim()).filter(s => s) : [];
      const customPc = [];
      const customMobile = [];
      rawList.forEach(function (item) {
        const hit = item.match(/^(m|移动)\s*[:：]\s*(.+)$/i);
        if (hit) customMobile.push(hit[2].trim());
        else customPc.push(item);
      });
      // 3. 自动扫描目录：PC 用 source/video，移动端用 source/video/m
      const pcList = Array.isArray(conf.localVideos) ? conf.localVideos : [];
      const mobileList = Array.isArray(conf.localVideosMobile) ? conf.localVideosMobile : [];
      const mobile = isMobileDevice();

      let sources = defaultVideoSources;
      if (mobile) {
        // 移动端：移动端手填 > 电脑端手填 > m 目录 > 根目录 > 默认
        if (customMobile.length > 0) sources = customMobile;
        else if (customPc.length > 0) sources = customPc;
        else if (mobileList.length > 0) sources = mobileList;
        else if (pcList.length > 0) sources = pcList;
      } else {
        // 电脑端：电脑端手填 > 根目录 > 默认
        if (customPc.length > 0) sources = customPc;
        else if (pcList.length > 0) sources = pcList;
      }
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

  // ===== 下载确认弹窗 =====
  let confirmMask = null;

  function closeDownloadConfirm() {
    if (confirmMask && confirmMask.parentNode) {
      confirmMask.parentNode.removeChild(confirmMask);
    }
    confirmMask = null;
  }

  function showDownloadConfirm(code, url, copyFailed) {
    closeDownloadConfirm();

    const mask = document.createElement('div');
    mask.className = 'dl-confirm-mask';

    const box = document.createElement('div');
    box.className = 'dl-confirm-box';

    const title = document.createElement('div');
    title.className = 'dl-confirm-title';
    title.textContent = copyFailed ? '提取码未复制成功' : '提取码已复制';

    const codeEl = document.createElement('div');
    codeEl.className = 'dl-confirm-code';
    codeEl.textContent = code;

    const tip = document.createElement('div');
    tip.className = 'dl-confirm-tip';
    tip.textContent = copyFailed
      ? '请手动选中上面的提取码复制，再前往网盘'
      : '提取码已在剪贴板，去网盘粘贴即可';

    const actions = document.createElement('div');
    actions.className = 'dl-confirm-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'dl-btn dl-btn-cancel';
    cancelBtn.textContent = '取消';

    const okBtn = document.createElement('button');
    okBtn.className = 'dl-btn dl-btn-ok';
    okBtn.textContent = '去网盘下载';

    actions.appendChild(cancelBtn);
    actions.appendChild(okBtn);
    box.appendChild(title);
    box.appendChild(codeEl);
    box.appendChild(tip);
    box.appendChild(actions);
    mask.appendChild(box);
    document.body.appendChild(mask);
    confirmMask = mask;

    cancelBtn.addEventListener('click', closeDownloadConfirm);
    okBtn.addEventListener('click', function () {
      closeDownloadConfirm();
      if (url) window.open(url, '_blank', 'noopener');
    });
    mask.addEventListener('click', function (ev) {
      if (ev.target === mask) closeDownloadConfirm();
    });
  }

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') closeDownloadConfirm();
  });

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.pan-button');
    if (!btn) return;

    const card = btn.closest('.pan-link-card');
    if (!card) return;

    // 按钮外面包了一层 <a target="_blank">，先拦住默认跳转
    const linkEl = btn.closest('a');
    const url = linkEl ? linkEl.href : '';
    if (url) e.preventDefault();

    const codeEl = card.querySelector('.pan-code');
    const code = codeEl ? extractCode(codeEl.textContent) : '';

    // 没有提取码：直接打开链接
    if (!code) {
      if (url) window.open(url, '_blank', 'noopener');
      return;
    }

    // 复制成功后弹窗确认，用户点"去网盘下载"才跳转
    copyToClipboard(code)
      .then(function () {
        showDownloadConfirm(code, url, false);
      })
      .catch(function () {
        showDownloadConfirm(code, url, true);
      });
  });
});
