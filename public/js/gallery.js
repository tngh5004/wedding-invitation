// 갤러리 — 확대 이미지 1장 + 1×3 썸네일 윈도우(스와이프, 무한 루프) + 라이트박스
window.WeddingGallery = (() => {
  const { el } = window.WeddingConfig;
  let photos = [];
  let current = 0;          // 캐러셀 중앙(=확대 표시) 인덱스
  let mainImg, track, animating = false;

  const mod = (n) => ((n % photos.length) + photos.length) % photos.length;

  // ===== 라이트박스 (확대보기 — 스와이프 유지) =====
  let box, lbImg, counterEl, lbIndex = 0;

  function lbUpdate() {
    lbImg.src = photos[lbIndex].src;
    lbImg.alt = photos[lbIndex].alt || '';
    counterEl.textContent = `${lbIndex + 1} / ${photos.length}`;
  }
  function lbOpen(idx) {
    lbIndex = idx;
    lbUpdate();
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function lbClose() {
    box.classList.remove('open');
    document.body.style.overflow = '';
    // 라이트박스에서 넘긴 위치를 캐러셀에 동기화
    if (lbIndex !== current) {
      current = lbIndex;
      syncMain();
      renderTrack();
    }
  }
  function lbMove(delta) {
    lbIndex = mod(lbIndex + delta);
    lbUpdate();
  }

  function buildLightbox() {
    box = el('div', 'lightbox');
    const closeBtn = el('button', 'lightbox-close', '×');
    closeBtn.setAttribute('aria-label', '닫기');
    const prev = el('button', 'lightbox-nav prev', '‹');
    const next = el('button', 'lightbox-nav next', '›');
    lbImg = document.createElement('img');
    counterEl = el('div', 'lightbox-counter');

    closeBtn.addEventListener('click', lbClose);
    prev.addEventListener('click', (e) => { e.stopPropagation(); lbMove(-1); });
    next.addEventListener('click', (e) => { e.stopPropagation(); lbMove(1); });
    box.addEventListener('click', (e) => { if (e.target === box) lbClose(); });
    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') lbClose();
      if (e.key === 'ArrowLeft') lbMove(-1);
      if (e.key === 'ArrowRight') lbMove(1);
    });

    let startX = null;
    box.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 48) lbMove(dx > 0 ? -1 : 1);
      startX = null;
    }, { passive: true });

    box.appendChild(closeBtn);
    box.appendChild(prev);
    box.appendChild(lbImg);
    box.appendChild(next);
    box.appendChild(counterEl);
    document.body.appendChild(box);
  }

  // ===== 캐러셀 =====
  function syncMain() {
    mainImg.src = photos[current].src;
    mainImg.alt = photos[current].alt || '';
  }

  // 트랙에 중앙±2 총 5장을 렌더하고 -20%(한 칸) 이동해 중앙 정렬
  // → 한 칸씩 슬라이드 후 재렌더하는 방식으로 무한 루프 구현
  function renderTrack() {
    track.innerHTML = '';
    for (let d = -2; d <= 2; d++) {
      const idx = mod(current + d);
      const item = el('div', 'gt-item');
      if (d === 0) item.classList.add('active');
      const img = document.createElement('img');
      img.src = photos[idx].src;
      img.alt = photos[idx].alt || '';
      img.draggable = false;
      item.addEventListener('click', () => {
        if (d === 0) lbOpen(current);       // 중앙 썸네일 → 확대보기
        else move(d > 0 ? 1 : -1);          // 옆 썸네일 → 그쪽으로 이동
      });
      item.appendChild(img);
      track.appendChild(item);
    }
    track.style.transition = 'none';
    track.style.transform = 'translateX(-20%)';
  }

  function move(delta) {
    if (animating || !photos.length) return;
    animating = true;
    // 강제 리플로우로 transition:none 상태 확정 후 애니메이션 시작
    void track.offsetWidth;
    track.style.transition = 'transform .3s ease';
    track.style.transform = `translateX(${-20 - delta * 20}%)`;
    const done = () => {
      if (!animating) return;
      animating = false;
      current = mod(current + delta);
      syncMain();
      renderTrack();
    };
    track.addEventListener('transitionend', done, { once: true });
    setTimeout(done, 400); // transitionend 미발생 대비
  }

  function addSwipe(target) {
    let startX = null;
    target.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    target.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) move(dx > 0 ? -1 : 1);
      startX = null;
    }, { passive: true });
  }

  function render(container, galleryData) {
    photos = galleryData;
    buildLightbox();
    mainImg = container.querySelector('.gallery-main img');
    track = container.querySelector('.gallery-track');

    syncMain();
    mainImg.addEventListener('click', () => lbOpen(current));
    addSwipe(container.querySelector('.gallery-main'));   // 확대 이미지에서도 스와이프 가능
    addSwipe(container.querySelector('.gallery-strip'));
    renderTrack();
  }

  return { render };
})();
