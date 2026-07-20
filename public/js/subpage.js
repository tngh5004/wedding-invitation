// 서브 페이지 렌더 (groom/bride/location) — body[data-page] 로 분기
(async () => {
  const C = window.WeddingConfig;
  const data = await C.load();
  const page = document.body.dataset.page;

  if (page === 'groom' || page === 'bride') {
    const p = data[page];
    const roleLabel = page === 'groom' ? '신랑' : '신부';
    document.title = `${roleLabel} ${p.name}`;

    document.querySelector('.subpage-header h1').textContent = `${roleLabel}측 소개`;
    document.querySelector('.profile-photo img').src = p.photo;
    C.setText('.profile-name', p.name);
    C.setText('.profile-role', `${roleLabel} · ${p.order}`);
    C.setText('.profile-intro', p.intro);

    const contact = document.querySelector('.contact-btns');
    if (p.phone) {
      const call = C.el('a', null, '전화하기');
      call.href = `tel:${p.phone}`;
      const sms = C.el('a', null, '문자하기');
      sms.href = `sms:${p.phone}`;
      contact.appendChild(call);
      contact.appendChild(sms);
    }

    // 혼주 — 통합 사진 1장 + 성함 카드 2개
    const parentsPhoto = document.querySelector('.parents-photo img');
    parentsPhoto.src = p.parentsPhoto;
    parentsPhoto.alt = `${roleLabel}측 혼주`;
    const grid = document.querySelector('.parents-grid');
    [['father', '아버지'], ['mother', '어머니']].forEach(([key, rel]) => {
      const parent = p[key];
      const card = C.el('div', 'parent-card');
      card.appendChild(C.el('div', 'parent-rel', `${roleLabel}측 ${rel}`));
      card.appendChild(C.el('div', 'parent-name', parent.deceased ? `故 ${parent.name}` : parent.name));
      if (parent.phone && !parent.deceased) {
        const btns = C.el('div', 'contact-btns');
        const call = C.el('a', null, '전화');
        call.href = `tel:${parent.phone}`;
        btns.appendChild(call);
        card.appendChild(btns);
      }
      grid.appendChild(card);
    });

    // 계좌 — 비어 있으면 섹션 숨김
    const accWrap = document.querySelector('.accounts-wrap');
    if (p.accounts && p.accounts.length) {
      C.renderAccounts(accWrap, `${roleLabel}측 계좌번호`, p.accounts);
    } else {
      accWrap.closest('section').style.display = 'none';
    }
  }

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
    window.WeddingMap.renderTransport(document.querySelector('.transport-list'), data.transport);

    // 주소 복사
    const copyBtn = document.querySelector('.addr-copy');
    copyBtn.addEventListener('click', () => C.copyText(v.address, copyBtn));
  }

  C.initFadeIn();
})();
