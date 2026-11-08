// @ts-check
import { defineConfig } from 'astro/config';
import plexSubset from './integrations/plex-subset.mjs';

// 주소: https://hoy27.github.io/hoyeongrande/
// site = 도메인, base = 저장소 이름. 개인 도메인으로 옮기면 base 를 지운다.
export default defineConfig({
  site: 'https://hoy27.github.io',
  base: '/hoyeongrande',
  output: 'static',
  // 빌드 후 한글 폰트를 사이트에 쓰인 글자만 담은 파일로 줄인다 (integrations/plex-subset.mjs)
  integrations: [plexSubset()],
  // Media 썸네일(유튜브·사운드클라우드)을 빌드 때 받아서 최적화
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: '**.sndcdn.com' },
    ],
  },
  vite: {
    build: {
      // 작은 폰트 조각을 CSS 안에 base64 로 넣지 않는다.
      // (넣으면 안 쓰는 글자 조각까지 CSS 와 함께 전부 받게 됨)
      assetsInlineLimit: (file) => (/\.(woff2?|ttf|otf)$/.test(file) ? false : undefined),
    },
  },
  i18n: {
    locales: ['ko', 'en'],
    defaultLocale: 'ko',
    routing: { prefixDefaultLocale: false },
  },
});
