/**
 * 모바일 청첩장 백엔드 — Google Apps Script
 *
 * 설치 방법 (약 5분):
 * 1. https://sheets.new 에서 새 구글시트 생성 (이름 예: "청첩장 응답")
 * 2. 메뉴 [확장 프로그램] → [Apps Script] 클릭
 * 3. 기본 코드를 전부 지우고 이 파일 내용을 붙여넣기 → 저장
 * 4. 오른쪽 위 [배포] → [새 배포] → 유형 "웹 앱" 선택
 *    - 실행 계정: "나"
 *    - 액세스 권한: "모든 사용자"  ← 중요
 * 5. [배포] 클릭 → 권한 승인 → 발급된 "웹 앱 URL" 복사
 *    (https://script.google.com/macros/s/..../exec 형태)
 * 6. 청첩장의 public/assets/config/content.json 에서
 *    "api": { "baseUrl": "여기에 붙여넣기" }
 *
 * RSVP 응답과 방명록은 이 구글시트의 rsvp / guestbook 탭에 쌓입니다.
 * 방명록 글을 숨기려면 guestbook 탭에서 해당 행의 hidden 열에 y 를 입력하세요.
 */

const LIMITS = { name: 20, message: 500, phone: 20, meal: 20, guestMax: 20 };

function getSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean(v, maxLen) {
  if (typeof v !== 'string') return null;
  const s = v.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  if (!s || s.length > maxLen) return null;
  return s;
}

// ===== 쓰기 (RSVP / 방명록) =====
function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ error: '잘못된 요청' });
  }
  if (data.website) return json({ ok: true }); // honeypot — 봇은 조용히 무시

  const lock = LockService.getScriptLock();
  lock.tryLock(5000);
  try {
    if (data.type === 'rsvp') return handleRsvp(data);
    if (data.type === 'guestbook') return handleGuestbook(data);
    return json({ error: '알 수 없는 요청' });
  } finally {
    lock.releaseLock();
  }
}

function handleRsvp(data) {
  const side = ['groom', 'bride'].indexOf(data.side) >= 0 ? data.side : null;
  const attending = ['yes', 'no'].indexOf(data.attending) >= 0 ? data.attending : null;
  const name = clean(data.name, LIMITS.name);
  const count = parseInt(data.guest_count, 10);
  if (!side || !attending || !name || isNaN(count) || count < 0 || count > LIMITS.guestMax) {
    return json({ error: '입력값 오류' });
  }
  const sheet = getSheet('rsvp', ['등록일시', '측', '성함', '참석', '인원', '식사', '연락처']);
  sheet.appendRow([
    new Date(),
    side === 'groom' ? '신랑측' : '신부측',
    name,
    attending === 'yes' ? '참석' : '불참',
    count,
    clean(data.meal || '', LIMITS.meal) || '',
    clean(data.phone || '', LIMITS.phone) || '',
  ]);
  return json({ ok: true });
}

function handleGuestbook(data) {
  const name = clean(data.name, LIMITS.name);
  const message = clean(data.message, LIMITS.message);
  if (!name || !message) return json({ error: '입력값 오류' });
  const sheet = getSheet('guestbook', ['등록일시', '성함', '메시지', 'hidden']);
  sheet.appendRow([new Date(), name, message, '']);
  return json({ ok: true });
}

// ===== 읽기 (방명록 목록) =====
function doGet(e) {
  const action = (e.parameter && e.parameter.action) || '';
  if (action === 'guestbook') {
    const limit = Math.min(parseInt(e.parameter.limit, 10) || 10, 50);
    const offset = Math.max(parseInt(e.parameter.offset, 10) || 0, 0);
    const sheet = getSheet('guestbook', ['등록일시', '성함', '메시지', 'hidden']);
    const last = sheet.getLastRow();
    const rows = [];
    if (last > 1) {
      const values = sheet.getRange(2, 1, last - 1, 4).getValues();
      // 최신순 + 숨김 제외, 이름/메시지/일시만 노출
      for (let i = values.length - 1; i >= 0; i--) {
        const [ts, name, message, hidden] = values[i];
        if (String(hidden).trim().toLowerCase() === 'y') continue;
        rows.push({
          name: String(name),
          message: String(message),
          created_at: Utilities.formatDate(new Date(ts), 'Asia/Seoul', 'yyyy-MM-dd HH:mm'),
        });
      }
    }
    return json({ rows: rows.slice(offset, offset + limit), total: rows.length, limit: limit, offset: offset });
  }
  return json({ ok: true });
}
