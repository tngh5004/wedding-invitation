// 방명록 작성 + 목록 — Google Apps Script 연동
window.WeddingGuestbook = (() => {
  const { el } = window.WeddingConfig;
  const PAGE = 10;
  let offset = 0;
  let listEl, moreBtn, apiBase;

  function fmtDate(s) {
    // "2026-12-01 12:34" → "2026.12.01"
    return (s || '').slice(0, 10).replace(/-/g, '.');
  }

  async function loadList(reset) {
    if (reset) { offset = 0; listEl.innerHTML = ''; }
    try {
      const res = await fetch(`${apiBase}?action=guestbook&limit=${PAGE}&offset=${offset}`);
      if (!res.ok) return;
      const data = await res.json();
      data.rows.forEach((r) => {
        const item = el('div', 'gb-item');
        const head = el('div', 'gb-head');
        head.appendChild(el('span', 'gb-name', r.name));
        head.appendChild(el('span', 'gb-date', fmtDate(r.created_at)));
        item.appendChild(head);
        item.appendChild(el('div', 'gb-msg', r.message)); // textContent — XSS 안전
        listEl.appendChild(item);
      });
      offset += data.rows.length;
      moreBtn.style.display = offset < data.total ? 'block' : 'none';
    } catch (_) { /* 네트워크 오류 시 목록만 비워둠 */ }
  }

  function init(form, list, more, base) {
    apiBase = base;
    listEl = list;
    moreBtn = more;
    moreBtn.addEventListener('click', () => loadList(false));

    const msg = form.querySelector('.form-msg');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.submit-btn');
      btn.disabled = true;
      msg.className = 'form-msg';
      msg.textContent = '';
      const fd = new FormData(form);
      try {
        const res = await fetch(apiBase, {
          method: 'POST',
          body: JSON.stringify({
            type: 'guestbook',
            name: fd.get('name'),
            message: fd.get('message'),
            website: fd.get('website') || '',
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || '등록 실패');
        msg.classList.add('ok');
        msg.textContent = '축하 메시지가 등록되었습니다 ♥';
        form.reset();
        await loadList(true);
      } catch (err) {
        msg.classList.add('err');
        msg.textContent = err.message || '등록에 실패했습니다. 잠시 후 다시 시도해주세요.';
      } finally {
        btn.disabled = false;
      }
    });

    loadList(true);
  }

  return { init };
})();
