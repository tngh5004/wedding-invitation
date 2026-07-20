# 모바일 청첩장

**GitHub Pages(무료, 고정 URL) + Google Apps Script(RSVP/방명록 → 구글시트)** 로 운영하는 한국식 모바일 청첩장.

## 구조

| 경로 | 설명 |
|---|---|
| `public/index.html` | 메인 (커버·인사말·D-day·갤러리·동영상·오시는길·안내·계좌·RSVP·방명록) |
| `public/groom.html` / `bride.html` | 신랑측/신부측 소개 (혼주 통합 사진·계좌 포함) |
| `public/location.html` | 오시는 길 상세 (교통 안내 + 카카오/네이버/티맵 앱 연결) |
| `public/assets/config/content.json` | **모든 콘텐츠의 단일 소스** — 이름·혼주·계좌·일시·장소·문구·사진·API URL |
| `apps-script/Code.gs` | 구글시트에 붙여넣을 백엔드 코드 (설치법은 파일 상단 주석) |
| `.github/workflows/deploy-pages.yml` | main 푸시 시 `public/`을 GitHub Pages로 자동 배포 |
| `scripts/generate-placeholders.js` | 번호 플레이스홀더 이미지 생성 (`npm run placeholders`) |
| `scripts/optimize-images.js` | 실사진 최적화 (`media-original/` → `public/assets/images/`) |
| `server/`, `deploy/` | (예비) 맥 미니 자체 호스팅 방식 — 로컬 미리보기 서버로도 사용 |

## 최초 배포 절차

1. **Apps Script 설치** (5분): [apps-script/Code.gs](apps-script/Code.gs) 상단 주석의 6단계를 따라
   구글시트 생성 → 코드 붙여넣기 → 웹 앱 배포("모든 사용자") → 발급 URL을
   `public/assets/config/content.json`의 `api.baseUrl`에 입력
   (미입력 상태에서는 RSVP/방명록 섹션이 자동으로 숨겨짐)
2. **GitHub 저장소 생성 후 푸시** (main 브랜치)
3. GitHub 저장소 → Settings → Pages → Source를 **GitHub Actions** 로 선택
4. 푸시하면 자동 배포 → `https://<아이디>.github.io/<저장소명>/` 이 청첩장 URL

## 운영

- **참석 명단 확인**: 구글시트 `rsvp` 탭에서 바로 확인 (등록일시·측·성함·참석·인원·식사·연락처)
- **방명록 숨기기**: 구글시트 `guestbook` 탭에서 해당 행 `hidden` 열에 `y` 입력
- **콘텐츠 수정**: `content.json` 수정 → main에 푸시하면 자동 반영
- **예식 후**: 개인정보 보호를 위해 구글시트의 연락처 데이터를 삭제하세요

## 콘텐츠 교체

1. **문구/이름/계좌/일시**: `public/assets/config/content.json`만 수정
2. **사진**: `public/assets/images/`의 같은 파일명에 실사진 덮어쓰기
   (또는 `media-original/`에 원본을 넣고 `node scripts/optimize-images.js`)
3. **동영상**: GitHub 파일당 100MB 제한 — 아래처럼 압축 후 `content.json`의 `video.src` 지정
   ```bash
   ffmpeg -i 원본.mov -c:v libx264 -crf 26 -vf "scale=-2:1080" -c:a aac -movflags +faststart public/assets/video/main.mp4
   ```
   (비우면 동영상 섹션 자동 숨김. 100MB가 넘으면 해상도를 720p로 낮추거나 YouTube 링크 사용)

플레이스홀더 이미지(중앙 번호 1~18)는 번호로 슬롯을 식별해 교체:
1=커버, 2=신랑, 3=신부, 4=신랑측 혼주, 5=신부측 혼주, 6=약도, 7~18=갤러리 1~12

## 로컬 미리보기

```bash
npm install && npm start   # http://localhost:3000
```
