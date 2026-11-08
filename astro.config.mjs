// @ts-check
import { defineConfig } from 'astro/config';

// 주소: https://hoy27.github.io/hoyeongrande/
// site = 도메인, base = 저장소 이름. 개인 도메인으로 옮기면 base 를 지운다.
export default defineConfig({
  site: 'https://hoy27.github.io',
  base: '/hoyeongrande',
  output: 'static',
  // Media 썸네일(유튜브·사운드클라우드)을 빌드 때 받아서 최적화
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: '**.sndcdn.com' },
    ],
  },
  i18n: {
    locales: ['ko', 'en'],
    defaultLocale: 'ko',
    routing: { prefixDefaultLocale: false },
  },
});
