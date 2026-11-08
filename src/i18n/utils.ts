import { getRelativeLocaleUrl } from 'astro:i18n';
import { defaultLang, languages, ui, type Lang, type UiKey } from './ui';

export type { Lang };
export type LocalizedText = string | { ko: string; en?: string };

/** UI 문구. {name} 같은 자리표시자는 vars 로 채운다. */
export function t(lang: Lang, key: UiKey, vars: Record<string, string> = {}) {
  const template = ui[lang][key] ?? ui[defaultLang][key];
  return template.replace(/\{(\w+)\}/g, (_, name: string) => vars[name] ?? `{${name}}`);
}

/** 데이터 파일의 text 값을 언어에 맞게 고른다. en 이 없으면 ko 를 쓴다. */
export function localize(value: LocalizedText, lang: Lang): string;
export function localize(value: LocalizedText | undefined, lang: Lang): string | undefined;
export function localize(value: LocalizedText | undefined, lang: Lang) {
  if (value === undefined || typeof value === 'string') return value;
  return value[lang] ?? value.ko;
}

export function otherLang(lang: Lang): Lang {
  return lang === 'ko' ? 'en' : 'ko';
}

export const allLangs = Object.keys(languages) as Lang[];

/** 언어별 경로. page 는 언어 접두어 없는 경로 ('' = 홈, 'links') */
export function localePath(lang: Lang, page = '') {
  return getRelativeLocaleUrl(lang, page);
}

export const htmlLang: Record<Lang, string> = { ko: 'ko', en: 'en' };
export const ogLocale: Record<Lang, string> = { ko: 'ko_KR', en: 'en_US' };
