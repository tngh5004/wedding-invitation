// 오시는 길 — 지도 앱 모바일 딥링크 (카카오맵/네이버지도/티맵)
// 앱 스킴으로 앱을 먼저 시도하고, 앱이 없거나 데스크톱이면 웹 지도로 폴백한다.
window.WeddingMap = (() => {
  const { el } = window.WeddingConfig;

  // 앱 스킴 시도 → 일정 시간 내 앱 전환이 안 되면 웹 URL로 폴백
  function openApp(appUrl, webUrl) {
    const timer = setTimeout(() => {
      if (!document.hidden) window.location.href = webUrl;
    }, 1500);
    // 앱으로 전환되면 페이지가 숨겨지므로 폴백 취소
    const cancel = () => clearTimeout(timer);
    window.addEventListener('pagehide', cancel, { once: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancel();
    }, { once: true });
    window.location.href = appUrl;
  }

  function renderLinks(container, venue) {
    const name = encodeURIComponent(venue.name);
    const links = [
      {
        label: '카카오맵',
        app: `kakaomap://route?ep=${venue.lat},${venue.lng}&by=CAR`,
        web: `https://map.kakao.com/link/to/${name},${venue.lat},${venue.lng}`,
      },
      {
        label: '네이버지도',
        app: `nmap://route/car?dlat=${venue.lat}&dlng=${venue.lng}&dname=${name}`,
        web: `https://map.naver.com/p/search/${encodeURIComponent(venue.address)}`,
      },
      {
        label: '티맵',
        app: `tmap://route?goalname=${name}&goaly=${venue.lat}&goalx=${venue.lng}`,
        web: 'https://www.tmap.co.kr',
      },
    ];
    links.forEach((l) => {
      const a = el('a', null, l.label);
      a.href = l.web; // JS 미동작 환경 대비 기본 href는 웹
      a.addEventListener('click', (e) => {
        e.preventDefault();
        openApp(l.app, l.web);
      });
      container.appendChild(a);
    });
  }

  // transport: [{label, body, detailOnly?}] 배열 — 배열 순서대로 표시
  // detailOnly 항목은 상세 페이지(showDetail=true)에서만 표시
  function renderTransport(container, transport, showDetail) {
    (transport || []).forEach((t) => {
      if (!t || !t.label || !t.body) return;
      if (t.detailOnly && !showDetail) return;
      const li = document.createElement('li');
      li.appendChild(el('span', 't-label', t.label));
      li.appendChild(el('span', 't-body', t.body));
      container.appendChild(li);
    });
  }

  return { renderLinks, renderTransport };
})();
