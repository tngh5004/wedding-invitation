// content.json 로드 + 공용 유틸
window.WeddingConfig = (() => {
  let cache = null;

  async function load() {
    if (cache) return cache;
    const res = await fetch('assets/config/content.json');
    if (!res.ok) throw new Error('콘텐츠 로드 실패');
    cache = await res.json();
    return cache;
  }

  // 텍스트 안전 삽입 (XSS 방지 — 항상 textContent 사용)
  function setText(sel, text) {
    const el = document.querySelector(sel);
    if (el) el.textContent = text ?? '';
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  async function copyText(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      // 구형 브라우저 fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '복사됨';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
    }
  }

  // 스크롤 등장 애니메이션
  function initFadeIn() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.fade-in').forEach((n) => io.observe(n));
  }

  // 계좌 아코디언 렌더 (신랑측/신부측 공용)
  function renderAccounts(container, label, accounts) {
    const group = el('div', 'account-group');
    const toggle = el('button', 'account-toggle');
    toggle.appendChild(el('span', null, label));
    toggle.appendChild(el('span', 'arrow', '▼'));
    const items = el('div', 'account-items');
    accounts.forEach((a) => {
      const item = el('div', 'account-item');
      const info = el('div');
      info.appendChild(el('div', null, `${a.bank} ${a.number}`));
      info.appendChild(el('div', 'holder', a.holder));
      const btn = el('button', 'copy-btn', '복사');
      btn.addEventListener('click', () => copyText(`${a.bank} ${a.number}`, btn));
      item.appendChild(info);
      item.appendChild(btn);
      items.appendChild(item);
    });
    toggle.addEventListener('click', () => group.classList.toggle('open'));
    group.appendChild(toggle);
    group.appendChild(items);
    container.appendChild(group);
  }

  return { load, setText, el, copyText, initFadeIn, renderAccounts };
})();
