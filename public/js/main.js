// 메인 페이지 렌더 오케스트레이션
(async () => {
  const C = window.WeddingConfig;
  const data = await C.load();
  const { wedding, greeting, groom, bride } = data;

  document.title = `${groom.name} ♥ ${bride.name} 결혼합니다`;

  // 커버 (텍스트는 이미지로 대체됨 — scripts/generate-cover-text.py 로 재생성)
  document.querySelector('.cover > img').src = data.cover.photo;

  // 인사말
  C.setText('.greeting-title', greeting.title);
  C.setText('.greeting-body', greeting.body);

  // 혼주 라인 — 3열 그리드(부모/관계/이름)로 신랑·신부 이름을 같은 세로선에 정렬
  const parentsWrap = document.querySelector('.parents-line');
  parentsWrap.innerHTML = '';
  function parentsRow(p) {
    const list = [p.father, p.mother]
      .filter((x) => x && x.name)
      .map((x) => (x.deceased ? `故 ${x.name}` : x.name));
    const parentsEl = C.el('span', 'p-parents', list.join(' · '));
    // 부모가 한 분이면 열 중앙(두 분 이름 사이 정도)에 배치
    if (list.length === 1) parentsEl.classList.add('single');
    parentsWrap.appendChild(parentsEl);
    parentsWrap.appendChild(C.el('span', 'p-rel', `의 ${p.order}`));
    parentsWrap.appendChild(C.el('span', 'p-name', p.name));
  }
  parentsRow(groom);
  parentsRow(bride);

  // 캘린더 + D-day
  const W = window.WeddingCountdown;
  W.renderCalendar(document.querySelector('.calendar'), wedding.date);
  W.startDday(document.querySelector('.dday-wrap'), wedding.date, `${groom.name} ♥ ${bride.name}`);

  // 갤러리 (확대 1장 + 1×3 스와이프 윈도우)
  window.WeddingGallery.render(document.querySelector('.gallery-carousel'), data.gallery);

  // 동영상 (src 없으면 섹션 숨김) — IntersectionObserver 로 lazy 주입
  const videoSection = document.querySelector('.video-section');
  if (data.video && data.video.src) {
    const video = videoSection.querySelector('video');
    video.poster = data.video.poster || '';
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const src = document.createElement('source');
          src.src = data.video.src;
          src.type = 'video/mp4';
          video.appendChild(src);
          video.load();
          io.disconnect();
        }
      });
    }, { rootMargin: '200px' });
    io.observe(video);
  } else {
    videoSection.style.display = 'none';
  }

  // 오시는 길 요약
  const v = wedding.venue;
  C.setText('.venue-name', [v.name, v.hall].filter(Boolean).join(' '));
  C.setText('.venue-addr', v.address);
  const telA = document.querySelector('.venue-tel a');
  telA.textContent = v.tel;
  telA.href = `tel:${v.tel}`;
  document.querySelector('.map-sketch img').src = data.mapSketch;
  window.WeddingMap.renderLinks(document.querySelector('.map-links'), v);
  window.WeddingMap.renderTransport(document.querySelector('.transport-list'), data.transport);

  // 공지/안내
  const noticeList = document.querySelector('.notice-list');
  data.notice.forEach((n) => {
    const li = document.createElement('li');
    li.appendChild(C.el('div', 'n-title', n.title));
    li.appendChild(C.el('div', 'n-body', n.body));
    noticeList.appendChild(li);
  });

  // 계좌 — 양쪽 모두 비어 있으면 섹션 숨김
  const accWrap = document.querySelector('.accounts-wrap');
  const groomAcc = groom.accounts || [];
  const brideAcc = bride.accounts || [];
  if (groomAcc.length || brideAcc.length) {
    if (groomAcc.length) C.renderAccounts(accWrap, '신랑측 계좌번호', groomAcc);
    if (brideAcc.length) C.renderAccounts(accWrap, '신부측 계좌번호', brideAcc);
  } else {
    accWrap.closest('section').style.display = 'none';
  }

  // 방명록 — Apps Script URL(api.baseUrl) 미설정 시 섹션 숨김
  const apiBase = data.api && data.api.baseUrl;
  if (apiBase) {
    window.WeddingGuestbook.init(
      document.querySelector('#gb-form'),
      document.querySelector('.gb-list'),
      document.querySelector('.gb-more'),
      apiBase
    );
  } else {
    document.querySelector('#gb-form').closest('section').style.display = 'none';
  }

  // 엔딩
  document.querySelector('.ending img').src = data.ending.photo;
  C.setText('.ending-msg', data.ending.message);
  C.setText('.footer', `${groom.name} ♥ ${bride.name}`);

  C.initFadeIn();
})();
