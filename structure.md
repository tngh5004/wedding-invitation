# 프로젝트 구조 및 운영 가이드

김수호 ♥ 홍소연 모바일 청첩장 — **GitHub Pages(무료, 고정 URL) + Google Apps Script(RSVP/방명록 → 구글시트)** 구조.

- 청첩장 URL: https://tngh5004.github.io/wedding-invitation/
- 예식: 2026년 12월 19일 토요일 낮 12시, 경기교총웨딩하우스 (수원시 팔달구 팔달산로 89-13)

## 페이지 구성

| 경로 | 설명 |
|---|---|
| `public/index.html` | 메인 싱글 스크롤 — 커버(사진+이미지화된 문구) · 인사말/혼주 · D-day 캘린더 · 갤러리 · 오시는길 · 예식안내 · 계좌 · 방명록 |
| `public/groom.html` / `bride.html` | 신랑측/신부측 소개 — 프로필·연락 버튼·혼주(통합 사진+성함 카드)·계좌 |
| `public/location.html` | 오시는 길 상세 — 약도, 카카오맵/네이버지도/티맵 앱 딥링크, 교통 안내 |

## 주요 구현 사항

- **글씨체**: 마루부리(네이버 무료 배포 세리프체) Regular/SemiBold/Bold를 woff2로 변환해 자체 호스팅 (`public/assets/fonts/`). 기기 설치 폰트와 무관하게 안드로이드/iOS 공통 적용.
- **커버 문구 이미지화**: 웹폰트 다운로드 전에도 첫 화면이 같은 글씨체로 보이도록, 커버의 이름/일시/장소 문구를 폰트 글리프에서 추출한 벡터 SVG(`cover-text.svg`)로 표시. 하트는 핫핑크.
- **갤러리**: 확대 이미지 1장 + 아래 1×3 썸네일 윈도우(캐러셀). 스와이프/탭으로 이동, 12장 무한 루프(끝↔처음 연결). 확대 이미지·중앙 썸네일 클릭 시 전체화면 확대보기(라이트박스, 스와이프 넘김·캐러셀 동기화).
- **혼주 표기**: 인사말의 혼주 라인은 3열 그리드로, 신랑/신부 이름이 같은 세로선에 정렬. 신부측은 어머니만 표시.
- **지도 딥링크**: 모바일에서 카카오맵/네이버지도/티맵 앱을 스킴으로 열고, 앱 미설치·데스크톱은 웹 지도로 자동 폴백.
- **교통편**: `content.json`의 `transport` 배열 순서대로 표시 — 웨딩홀 셔틀버스(수원역) → 부산 대절버스(괴정역, 문의 010-4004-0467) → 주차.
- **글자 크기**: 전체 1.5배 확대 적용(본문 기본 24px, 섹션 라벨 27px 등).

## 파일 구조

```
├── public/                        # GitHub Pages 배포 대상 (Actions가 이 폴더만 배포)
│   ├── index.html / groom.html / bride.html / location.html
│   ├── css/{reset.css, style.css}
│   ├── js/
│   │   ├── config-loader.js       # content.json 로드 + 공용 유틸(계좌 아코디언 등)
│   │   ├── main.js                # 메인 페이지 렌더 오케스트레이션
│   │   ├── subpage.js             # 신랑/신부/오시는길 서브 페이지 렌더
│   │   ├── countdown.js           # D-day 캘린더/카운트다운
│   │   ├── gallery.js             # 갤러리 캐러셀 + 라이트박스
│   │   ├── map.js                 # 지도 앱 딥링크 + 교통편 렌더
│   │   ├── rsvp.js / guestbook.js # Apps Script 연동 폼
│   └── assets/
│       ├── config/content.json    # ★ 모든 콘텐츠의 단일 소스 (이름·혼주·계좌·일시·교통·API URL)
│       ├── fonts/                 # 마루부리 woff2 (400/600/700)
│       ├── images/                # 커버/프로필/혼주/약도/갤러리 (현재 번호 플레이스홀더)
│       └── video/                 # 동영상 (mp4, faststart 인코딩)
├── apps-script/Code.gs            # 구글시트에 붙여넣는 백엔드 (설치법은 파일 상단 주석)
├── scripts/
│   ├── generate-placeholders.js   # 번호(1~18) 플레이스홀더 이미지 생성
│   ├── generate-cover-text.py     # 커버 문구 SVG 생성 (문구 변경 시 재실행)
│   ├── optimize-images.js         # 실사진 최적화 (media-original/ → public/assets/images/)
│   └── tunnel-url.sh              # (구방식) Cloudflare 터널 URL 확인
├── .github/workflows/deploy-pages.yml  # main 푸시 시 public/ 자동 배포
├── server/ + deploy/              # (예비) 맥 미니 자체 호스팅용 — 로컬 미리보기 서버로 사용
└── data/                          # 로컬 서버용 SQLite (미사용, git 제외)
```

## RSVP / 방명록 데이터

하객 데이터는 저장소가 아니라 **운영자 구글 계정의 구글시트**에 기록된다 (개인정보가 공개 저장소에 올라가지 않음).

- `rsvp` 탭: 등록일시 · 측 · 성함 · 참석 · 인원 · (미사용) · 소속
- `guestbook` 탭: 등록일시 · 성함 · 메시지 · hidden — **숨기려면 hidden 열에 `y` 입력**
- Apps Script 웹 앱 URL은 `content.json`의 `api.baseUrl`. 미설정 시 두 섹션 자동 숨김.
- 예식 후에는 개인정보 보호를 위해 시트의 응답 데이터를 삭제할 것.

## 콘텐츠 교체 방법

1. **문구/이름/계좌/일시/교통**: `public/assets/config/content.json` 수정 → 푸시 (약 1분 내 자동 배포)
2. **커버 문구**: `scripts/generate-cover-text.py`의 `LINES` 수정 → `python3 scripts/generate-cover-text.py` 실행 → 푸시
3. **사진**: `public/assets/images/`의 같은 파일명에 실사진 덮어쓰기, 또는 `media-original/`에 원본을 넣고 `node scripts/optimize-images.js`
   - 이미지 번호: 01=커버(공유 썸네일 겸용, 갤러리 마지막에 재사용), 02~09=갤러리 8장, 11=약도 (모두 png)
   - 프로필/혼주 사진: groom/, bride/ 폴더 (profile.jpg, parents.jpg)
4. **동영상**: 파일당 100MB 제한 — 압축 후 `content.json`의 `video.src` 지정 (비우면 섹션 숨김)
   ```bash
   ffmpeg -i 원본.mov -c:v libx264 -crf 26 -vf "scale=-2:1080" -c:a aac -movflags +faststart public/assets/video/main.mp4
   ```

## 로컬 미리보기

```bash
npm install && npm start   # http://localhost:3000
```
로컬 서버(Express)는 미리보기 용도이며, 배포는 GitHub Pages가 담당한다.

## 배포

`main` 브랜치에 푸시하면 GitHub Actions가 `public/`을 자동 배포한다.
저장소 Settings → Pages → Source: **GitHub Actions** (설정 완료됨).
