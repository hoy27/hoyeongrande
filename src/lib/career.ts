import type { CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/utils';

export type CareerItem = CollectionEntry<'career'>['data'];

export const TIME_ZONE = 'Asia/Seoul';

/** 서울 기준 오늘 날짜 'YYYY-MM-DD' */
export function todayInSeoul(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** 끝나는 날(endDate, 없으면 date) */
function lastDay(item: CareerItem) {
  return item.endDate ?? item.date;
}

/** 시작은 했고 아직 안 끝난 항목 (레지던시 등) */
export function isOngoing(item: CareerItem, today: string) {
  return item.date <= today && lastDay(item) >= today;
}

/**
 * Upcoming: 끝나는 날이 오늘 이후(오늘 포함). 날짜 오름차순.
 * Past: 나머지. 날짜 내림차순.
 */
export function splitCareer(items: CareerItem[], today = todayInSeoul()) {
  const upcoming = items
    .filter((item) => lastDay(item) >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = items
    .filter((item) => lastDay(item) < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  return { upcoming, past };
}

/** 연도별로 묶는다. 입력 순서를 유지하므로 정렬된 목록을 넘긴다. */
export function groupByYear(items: CareerItem[]) {
  const groups = new Map<string, CareerItem[]>();
  for (const item of items) {
    const year = item.date.slice(0, 4);
    groups.set(year, [...(groups.get(year) ?? []), item]);
  }
  return [...groups].map(([year, list]) => ({ year, items: list }));
}

function formatOne(date: string, lang: Lang, withYear: boolean) {
  const [y, m, d] = date.split('-');
  if (lang === 'ko') return withYear ? `${y}.${m}.${d}` : `${m}.${d}`;
  const month = new Date(Date.UTC(+y, +m - 1, +d)).toLocaleString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  });
  return withYear ? `${month} ${+d}, ${y}` : `${month} ${+d}`;
}

/** 표시용 날짜. 기간이면 '2026.03.01 – 12.31' 처럼 같은 해는 연도를 생략한다. */
export function formatDateRange(item: CareerItem, lang: Lang) {
  const start = formatOne(item.date, lang, true);
  if (!item.endDate || item.endDate === item.date) return start;
  const sameYear = item.endDate.slice(0, 4) === item.date.slice(0, 4);
  return `${start} – ${formatOne(item.endDate, lang, !sameYear || lang === 'en')}`;
}
