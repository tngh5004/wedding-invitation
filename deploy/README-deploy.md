# 배포 가이드 — 맥 미니 + Cloudflare Tunnel

## 1. 사전 준비

```bash
brew install cloudflared   # 이미 설치됨
```

## 2. 무료 Quick Tunnel (현재 구성 — 계정/도메인 불필요)

**완전 무료, 가입조차 불필요.** 터널을 켜면 `https://xxxx.trycloudflare.com` 외부 URL이 발급됩니다.

```bash
# 터널 실행 (launchd에 등록하면 자동 실행됨 — 아래 3번)
cloudflared tunnel --url http://localhost:3000

# 현재 발급된 외부 URL 확인 (어느 위치에서든 동일하게 실행 가능)
/Users/hongkim/Projects/wedding_invitation/scripts/tunnel-url.sh
```

**주의: URL은 터널이 재시작될 때마다 바뀝니다** (맥 재부팅 포함).
- 청첩장 링크를 하객에게 보내기 전에 `/Users/hongkim/Projects/wedding_invitation/scripts/tunnel-url.sh`로 최종 URL을 확인하고,
  **배포 후에는 맥 미니를 재부팅하지 않아야** 링크가 유지됩니다.
- URL 고정이 필요하면 아래 중 하나:
  - **저가 도메인 구입** (연 2천 원 수준, .xyz 등) 후 아래 4번 Named Tunnel 사용 — 가장 확실
  - 이미 보유한 도메인이 있다면 Cloudflare에 등록 후 Named Tunnel 사용 (무료)

## 4. Named Tunnel 설정 (도메인 보유 시 — URL 고정)

```bash
# 1) Cloudflare 로그인 (브라우저 열림)
cloudflared tunnel login

# 2) 터널 생성
cloudflared tunnel create wedding

# 3) 설정 파일 작성: ~/.cloudflared/config.yml
#    <UUID>는 위 명령 출력의 터널 ID로 교체
```

`~/.cloudflared/config.yml`:
```yaml
tunnel: <UUID>
credentials-file: /Users/hongkim/.cloudflared/<UUID>.json
ingress:
  - hostname: wedding.example.com   # 본인 도메인으로 교체
    service: http://localhost:3000
  - service: http_status:404
```

```bash
# 4) DNS 라우팅 연결
cloudflared tunnel route dns wedding wedding.example.com

# 5) 수동 실행 테스트
cloudflared tunnel run wedding
```

## 3. 재부팅 자동 실행 (launchd)

> Quick Tunnel 방식은 재부팅하면 URL이 바뀝니다. 하객에게 링크를 보낸 뒤에는 재부팅을 피하세요.

```bash
# plist 2종을 LaunchAgents 에 복사
cp deploy/com.wedding.invitation.plist deploy/com.wedding.cloudflared.plist ~/Library/LaunchAgents/

# 로드 (즉시 실행 + 재부팅 시 자동 실행)
launchctl load ~/Library/LaunchAgents/com.wedding.invitation.plist
launchctl load ~/Library/LaunchAgents/com.wedding.cloudflared.plist

# 상태 확인
launchctl list | grep com.wedding
curl http://localhost:3000/healthz
```

- 로그: `data/server.log`, `data/cloudflared.log`
- 해제: `launchctl unload ~/Library/LaunchAgents/com.wedding.*.plist`
- 주의: plist의 node 경로는 nvm 버전에 고정되어 있음 — node 업그레이드 시 경로 수정 필요.

## 5. 맥 미니 상시 구동 설정

- 시스템 설정 → 에너지: **잠자기 방지** 켜기 (또는 `sudo pmset -a sleep 0`)
- 시스템 설정 → 사용자: **자동 로그인** 활성화 (FileVault 사용 시 재부팅 후 첫 잠금 해제 필요)
- 정전 후 자동 재시동: `sudo pmset -a autorestart 1`

## 6. 운영

- 관리자 페이지: `https://<도메인>/admin.html` — `.env`의 `ADMIN_TOKEN` 입력
- DB 백업: `cp data/wedding.db ~/Backups/wedding-$(date +%Y%m%d).db` (주기적으로)
- **예식 후**: 하객 개인정보 보호를 위해 RSVP 데이터(연락처 포함)를 삭제하세요.
  ```bash
  sqlite3 data/wedding.db "DELETE FROM rsvp; VACUUM;"
  ```

## 7. 콘텐츠 교체

- 모든 문구/이름/계좌/일시: `public/assets/config/content.json` 수정
- 실사진 교체: `media-original/` 에 같은 구조로 원본을 넣고 `node scripts/optimize-images.js`
  (또는 `public/assets/images/` 의 같은 파일명에 직접 덮어쓰기)
- 동영상: `ffmpeg -i 원본.mov -c:v libx264 -crf 23 -preset medium -c:a aac -movflags +faststart public/assets/video/main.mp4`
  후 `content.json`의 `video.src`에 `assets/video/main.mp4` 지정
