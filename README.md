# DJ 프로필 사이트

Astro 정적 사이트. 소개 페이지(`/`, `/en/`)와 링크 페이지(`/links`, `/en/links`).

## 콘텐츠 수정

HTML은 건드리지 않고 아래 파일만 고친다. `main`에 push하면 자동 배포된다.

| 바꿀 것 | 파일 |
| --- | --- |
| 공연 이력(History) 추가 | `src/content/career.yaml` |
| 영상·믹스셋(Media) | `src/content/media.yaml` (주소만 적으면 썸네일은 자동) |
| 링크 버튼 | `src/content/links.yaml` |
| 이름·한 줄 소개·이메일·장르·사진 | `src/content/profile.yaml` |
| 소개 글 | `src/content/about/ko.md`, `en.md` |
| 프로필 사진 | `src/assets/profile.jpg` |
| 공유 미리보기 이미지 (1200×630) | `public/og.jpg` |
| 색·폰트 | `src/styles/global.css` 맨 위 변수 |
| 버튼·제목 문구 | `src/i18n/ui.ts` |

데이터가 잘못되면(없는 날짜, 없는 type, 필수값 누락) 빌드가 실패하고 어느 항목이 틀렸는지 알려준다.

## 로컬 실행

Node 22.23 이상이 필요하다 (`.nvmrc` = 24).

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # 타입 검사 + 빌드
```

## 배포

`.github/workflows/deploy.yml` 이 `main` 에 push 할 때마다 빌드·배포한다. (Actions 탭에서 수동 실행도 가능)

공연 날짜가 지나도 Upcoming → Past 이동은 다음 push(빌드) 때 반영된다.

- 저장소 Settings → Pages → Source: **GitHub Actions**
- GA4: Settings → Secrets and variables → Actions → Variables 에 `GA_ID` (`G-XXXXXXX`)
- 주소: https://hoy27.github.io/hoyeongrande/ (`astro.config.mjs` 의 `site` + `base`)
