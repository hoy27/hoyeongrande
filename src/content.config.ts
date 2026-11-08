import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';
import { ICON_NAMES } from './lib/icons';

/** 번역 가능한 문구: 문자열 하나(두 언어 공통) 또는 { ko, en } */
const text = z.union([
  z.string().min(1),
  z.object({ ko: z.string().min(1), en: z.string().min(1).optional() }),
]);

function isRealDate(value: string) {
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/**
 * YAML 을 날짜 자동 변환 없이 읽는다.
 * 기본 파서는 2026-02-30 을 3월 2일로 바꿔버려서 오타를 잡을 수 없다.
 */
const yamlFile = (path: string) => file(path, { parser: (text) => parseYaml(text, { schema: 'core' }) });

/** 'YYYY-MM-DD'. 형식이 다르거나 없는 날짜(2026-02-30)는 빌드 에러 */
const isoDate = z
  .string({ error: '날짜는 YYYY-MM-DD 형식이어야 합니다' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜는 YYYY-MM-DD 형식이어야 합니다')
  .refine(isRealDate, '존재하지 않는 날짜입니다');

export const CAREER_TYPES = ['gig', 'residency', 'festival', 'release', 'mix'] as const;

const career = defineCollection({
  loader: yamlFile('src/content/career.yaml'),
  schema: z
    .object({
      id: z.string().min(1),
      date: isoDate,
      endDate: isoDate.optional(),
      type: z.enum(CAREER_TYPES),
      title: text,
      venue: text.optional(),
      city: text.optional(),
      link: z.url().optional(),
      note: text.optional(),
      featured: z.boolean().default(false),
    })
    .strict()
    .refine((item) => !item.endDate || item.endDate >= item.date, {
      message: 'endDate는 date보다 같거나 늦어야 합니다',
      path: ['endDate'],
    }),
});

const links = defineCollection({
  loader: yamlFile('src/content/links.yaml'),
  schema: z
    .object({
      id: z.string().min(1),
      label: text,
      url: z.url(),
      icon: z.enum(ICON_NAMES).default('link'),
      highlight: z.boolean().default(false),
    })
    .strict(),
});

const profile = defineCollection({
  loader: yamlFile('src/content/profile.yaml'),
  schema: ({ image }) =>
    z
      .object({
        name: z.string().min(1),
        tagline: text,
        /** 링크 페이지 이름 아래 문구. 빈 문자열이면 줄 높이만 남기고 비워 둔다 */
        linksTagline: z.union([z.literal(''), text]).default(''),
        email: z.email(),
        location: text.optional(),
        genres: z.array(z.string()).default([]),
        photo: image().optional(),
        photoAlt: text.optional(),
        avatar: image().optional(),
        avatarAlt: text.optional(),
      })
      .strict(),
});

const media = defineCollection({
  loader: yamlFile('src/content/media.yaml'),
  schema: ({ image }) =>
    z
      .object({
        id: z.string().min(1),
        platform: z.enum(['youtube', 'soundcloud']),
        title: text,
        subtitle: text.optional(),
        url: z.url(),
        /** 비우면 영상·음원 주소에서 자동으로 가져온다 */
        thumbnail: image().optional(),
      })
      .strict(),
});

const about = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/about' }),
});

export const collections = { career, links, media, profile, about };
