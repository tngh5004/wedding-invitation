// 서브 페이지 렌더 (location) — body[data-page] 로 분기
(async () => {
  const C = window.WeddingConfig;
  const data = await C.load();
  const page = document.body.dataset.page;

  if (page === 'location') {
    const v = data.wedding.venue;
    document.title = `오시는 길 — ${v.name}`;
    C.setText('.venue-name', [v.name, v.hall].filter(Boolean).join(' '));
    C.setText('.venue-addr', v.address);
    const telA = document.querySelector('.venue-tel a');
    telA.textContent = v.tel;
    telA.href = `tel:${v.tel}`;
    document.querySelector('.map-sketch img').src = data.mapSketch;
    window.WeddingMap.renderLinks(document.querySelector('.map-links'), v);
    window.WeddingMap.renderTransport(document.querySelector('.transport-list'), data.transport, true);

    // 주소 복사
    const copyBtn = document.querySelector('.addr-copy');
    copyBtn.addEventListener('click', () => C.copyText(v.address, copyBtn));
  }

  C.initFadeIn();
})();
