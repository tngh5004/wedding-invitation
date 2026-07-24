// RSVP 폼 제출 — Google Apps Script 로 전송
// 주의: Content-Type 헤더를 지정하지 않아야(단순 요청) Apps Script CORS가 동작한다.
window.WeddingRsvp = (() => {
  function init(form, apiBase) {
    const msg = form.querySelector('.form-msg');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.submit-btn');
      btn.disabled = true;
      msg.className = 'form-msg';
      msg.textContent = '';

      const fd = new FormData(form);
      const body = {
        type: 'rsvp',
        side: fd.get('side'),
        attending: fd.get('attending'),
        name: fd.get('name'),
        guest_count: Number(fd.get('guest_count') || 1),
        phone: fd.get('phone') || '', // 시트의 '연락처' 열에 '소속' 값이 저장됨

        website: fd.get('website') || '', // honeypot
      };

      try {
        const res = await fetch(apiBase, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || '전송 실패');
        msg.classList.add('ok');
        msg.textContent = '참석 여부가 전달되었습니다. 감사합니다 ♥';
        form.reset();
      } catch (err) {
        msg.classList.add('err');
        msg.textContent = err.message || '전송에 실패했습니다. 잠시 후 다시 시도해주세요.';
      } finally {
        btn.disabled = false;
      }
    });
  }
  return { init };
})();
