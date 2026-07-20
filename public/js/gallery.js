// 갤러리 그리드 + 라이트박스 (스와이프 지원)
window.WeddingGallery = (() => {
  const { el } = window.WeddingConfig;
  let photos = [];
  let current = 0;
  let box, imgEl, counterEl;

  function open(idx) {
    current = idx;
    update();
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    box.classList.remove('open');
    document.body.style.overflow = '';
  }
  function update() {
    imgEl.src = photos[current].src;
    imgEl.alt = photos[current].alt || '';
    counterEl.textContent = `${current + 1} / ${photos.length}`;
  }
  function move(delta) {
    current = (current + delta + photos.length) % photos.length;
    update();
  }

  function buildLightbox() {
    box = el('div', 'lightbox');
    const closeBtn = el('button', 'lightbox-close', '×');
    closeBtn.setAttribute('aria-label', '닫기');
    const prev = el('button', 'lightbox-nav prev', '‹');
    const next = el('button', 'lightbox-nav next', '›');
    imgEl = document.createElement('img');
    counterEl = el('div', 'lightbox-counter');

    closeBtn.addEventListener('click', close);
    prev.addEventListener('click', (e) => { e.stopPropagation(); move(-1); });
    next.addEventListener('click', (e) => { e.stopPropagation(); move(1); });
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === 'ArrowRight') move(1);
    });

    // 터치 스와이프
    let startX = null;
    box.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 48) move(dx > 0 ? -1 : 1);
      startX = null;
    }, { passive: true });

    box.appendChild(closeBtn);
    box.appendChild(prev);
    box.appendChild(imgEl);
    box.appendChild(next);
    box.appendChild(counterEl);
    document.body.appendChild(box);
  }

  function render(container, galleryData) {
    photos = galleryData;
    buildLightbox();
    galleryData.forEach((p, i) => {
      const img = document.createElement('img');
      img.src = p.src;
      img.alt = p.alt || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('click', () => open(i));
      container.appendChild(img);
    });
  }

  return { render };
})();
