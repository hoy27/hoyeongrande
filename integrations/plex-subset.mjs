// @ts-check
/**
 * 빌드 후 단계: 한글 폰트(IBM Plex Sans KR)를 "사이트에 실제로 쓰인 글자만" 담은 파일로 바꾼다.
 *
 * 왜: 기본 폰트 패키지는 한글을 120여 개 조각으로 나눠 두어서, 몇 문장만 있어도
 *     조각을 15~20개(약 250KB) 받게 된다. 쓰인 글자만 모으면 굵기당 파일 1개로 충분하다.
 *
 * 순서
 *   1. 빌드된 HTML 전체에서 글자를 모은다
 *   2. 구글 폰트에 그 글자만 담은 폰트를 요청해서 받아 사이트에 넣는다 (방문자는 구글에 접속하지 않음)
 *   3. 기존 폰트 CSS 링크를 작은 @font-face 규칙(<style>)으로 바꾼다
 *   4. 더 이상 안 쓰는 조각 폰트와 CSS 를 지운다
 *
 * 어느 단계든 실패하면 아무것도 바꾸지 않고 기존 방식(조각 폰트)을 그대로 둔다.
 * `astro dev` 에는 영향이 없다 (빌드 때만 실행).
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FAMILY = 'IBM Plex Sans KR';
const WEIGHTS = [400, 600, 700];
// 구글 폰트는 브라우저 종류를 보고 형식을 정하므로, woff2 를 받도록 최신 크롬으로 요청
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36';

/** @param {string} dir */
async function listFiles(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listFiles(p)));
    else out.push(p);
  }
  return out;
}

/** @type {Record<string, string>} */
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/** 화면에 보이는 글자만 남긴다 (스크립트·스타일·태그 제거, 엔티티 해석) */
function visibleText(/** @type {string} */ html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, /** @type {string} */ n) => ENTITIES[n] ?? ' ');
}

/** @returns {import('astro').AstroIntegration} */
export default function plexSubset() {
  let base = '/';

  return {
    name: 'plex-subset',
    hooks: {
      'astro:config:done': ({ config }) => {
        base = config.base.endsWith('/') ? config.base : `${config.base}/`;
      },
      'astro:build:done': async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        const astroDir = join(distDir, '_astro');

        try {
          const files = await listFiles(distDir);
          const htmlFiles = files.filter((f) => f.endsWith('.html'));

          // 1. 글자 모으기 (영문·숫자·기본 기호는 항상 포함)
          const chars = new Set();
          for (let c = 0x20; c <= 0x7e; c++) chars.add(String.fromCharCode(c));
          for (const f of htmlFiles) {
            for (const ch of visibleText(await readFile(f, 'utf8'))) {
              if (!/\s/.test(ch)) chars.add(ch);
            }
          }
          const text = [...chars].sort().join('');

          // 2. 구글 폰트에서 그 글자만 담은 폰트 받기
          const cssUrl =
            `https://fonts.googleapis.com/css2?family=${encodeURIComponent(FAMILY).replace(/%20/g, '+')}` +
            `:wght@${WEIGHTS.join(';')}&display=swap&text=${encodeURIComponent(text)}`;
          const cssRes = await fetch(cssUrl, { headers: { 'User-Agent': UA } });
          if (!cssRes.ok) throw new Error(`구글 폰트 CSS 요청 실패 (${cssRes.status})`);
          const googleCss = await cssRes.text();

          const faces = [...googleCss.matchAll(/@font-face\s*{([^}]*)}/g)].map(([, body]) => ({
            weight: Number(body.match(/font-weight:\s*(\d+)/)?.[1]),
            src: body.match(/url\(([^)]+)\)\s*format\('woff2'\)/)?.[1],
            range: body.match(/unicode-range:\s*([^;]+);/)?.[1]?.trim(),
          }));
          if (faces.length !== WEIGHTS.length || faces.some((face) => !face.weight || !face.src)) {
            throw new Error('구글 폰트 응답 형식이 예상과 다름');
          }

          const rules = [];
          let totalBytes = 0;
          for (const face of faces) {
            const res = await fetch(/** @type {string} */ (face.src), { headers: { 'User-Agent': UA } });
            if (!res.ok) throw new Error(`폰트 파일 받기 실패 (${face.weight}, ${res.status})`);
            const data = Buffer.from(await res.arrayBuffer());
            totalBytes += data.length;
            const hash = createHash('sha256').update(data).digest('hex').slice(0, 8);
            const name = `ibm-plex-sans-kr-subset-${face.weight}.${hash}.woff2`;
            await writeFile(join(astroDir, name), data);
            rules.push(
              `@font-face{font-family:'${FAMILY}';font-style:normal;font-weight:${face.weight};font-display:swap;` +
                `src:url(${base}_astro/${name}) format('woff2')` +
                (face.range ? `;unicode-range:${face.range}` : '') +
                '}',
            );
          }
          const inlineStyle = `<style data-font="plex-subset">${rules.join('')}</style>`;

          // 3. 기존 폰트 CSS 연결(preload, 비동기 stylesheet, noscript)을 작은 <style> 로 바꾸기
          const fontsCssName = (await readdir(astroDir)).find((name) => /^fonts\.[\w-]+\.css$/.test(name));
          if (!fontsCssName) throw new Error('기존 폰트 CSS(fonts.*.css)를 찾지 못함');
          const linkPattern = new RegExp(
            `\\s*(?:<noscript>)?<link[^>]*href="${base}_astro/${fontsCssName.replace(/\./g, '\\.')}"[^>]*>(?:</noscript>)?`,
            'g',
          );
          for (const f of htmlFiles) {
            const html = await readFile(f, 'utf8');
            if (!linkPattern.test(html)) continue;
            linkPattern.lastIndex = 0;
            let replaced = false;
            const next = html.replace(linkPattern, () => {
              if (replaced) return '';
              replaced = true;
              return inlineStyle;
            });
            await writeFile(f, next);
          }

          // 4. 안 쓰는 조각 폰트와 CSS 지우기
          const leftovers = (await readdir(astroDir)).filter(
            (name) => name === fontsCssName || /^ibm-plex-sans-kr-(?!subset-).+\.(woff2?|ttf)$/.test(name),
          );
          await Promise.all(leftovers.map((name) => rm(join(astroDir, name))));

          logger.info(
            `한글 폰트를 사이트에 쓰인 ${chars.size}자로 줄였습니다: ` +
              `${WEIGHTS.length}개 파일, ${Math.round(totalBytes / 1024)}KB (조각 파일 ${leftovers.length - 1}개 삭제)`,
          );
        } catch (error) {
          logger.warn(
            `한글 폰트 줄이기를 건너뜁니다 (기존 조각 폰트를 그대로 사용): ${error instanceof Error ? error.message : error}`,
          );
        }
      },
    },
  };
}
