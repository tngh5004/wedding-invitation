// D-day 카운트다운 + 캘린더 렌더
window.WeddingCountdown = (() => {
  const { el } = window.WeddingConfig;

  function renderCalendar(container, weddingDate) {
    const d = new Date(weddingDate);
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();

    const title = el('div', 'calendar-title', `${year}년 ${month + 1}월`);
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    ['일', '월', '화', '수', '목', '금', '토'].forEach((w, i) => {
      const th = document.createElement('th');
      th.textContent = w;
      if (i === 0) th.className = 'sun';
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const first = new Date(year, month, 1).getDay();
    const last = new Date(year, month + 1, 0).getDate();
    let row = document.createElement('tr');
    for (let i = 0; i < first; i++) row.appendChild(document.createElement('td'));
    for (let date = 1; date <= last; date++) {
      const td = document.createElement('td');
      td.textContent = date;
      const dow = new Date(year, month, date).getDay();
      if (dow === 0) td.className = 'sun';
      if (date === day) td.classList.add('wedding-day');
      row.appendChild(td);
      if (dow === 6) { tbody.appendChild(row); row = document.createElement('tr'); }
    }
    if (row.children.length) tbody.appendChild(row);
    table.appendChild(tbody);

    container.appendChild(title);
    container.appendChild(table);
  }

  function startDday(container, weddingDate, names) {
    const target = new Date(weddingDate).getTime();

    const line = el('div', 'dday');
    const units = el('div', 'dday-count');
    const parts = {};
    [['days', '일'], ['hours', '시간'], ['mins', '분'], ['secs', '초']].forEach(([key, lbl]) => {
      const unit = el('div', 'unit');
      const num = el('div', 'num', '0');
      unit.appendChild(num);
      unit.appendChild(el('div', 'lbl', lbl));
      units.appendChild(unit);
      parts[key] = num;
    });

    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        line.textContent = `${names}의 결혼식이 시작되었습니다 ♥`;
        units.style.display = 'none';
        return;
      }
      const s = Math.floor(diff / 1000);
      parts.days.textContent = Math.floor(s / 86400);
      parts.hours.textContent = Math.floor((s % 86400) / 3600);
      parts.mins.textContent = Math.floor((s % 3600) / 60);
      parts.secs.textContent = s % 60;

      const dDays = Math.ceil((target - Date.now()) / 86400000);
      line.innerHTML = '';
      line.appendChild(document.createTextNode(`${names}의 결혼식까지 `));
      const b = el('b', null, `${dDays}일`);
      line.appendChild(b);
      line.appendChild(document.createTextNode(' 남았습니다'));
      setTimeout(tick, 1000);
    }
    tick();

    container.appendChild(units);
    container.appendChild(line);
  }

  return { renderCalendar, startDday };
})();
