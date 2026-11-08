import { getCollection, getEntry } from 'astro:content';
import { parse } from 'yaml';
import linksYaml from '../content/links.yaml?raw';
import mediaYaml from '../content/media.yaml?raw';
import { resolveThumbnail } from './media';

// Astro 는 항목을 id 순으로 돌려주므로, 파일에 적힌 순서대로 다시 정렬한다
function inFileOrder<T extends { id: string }>(items: T[], yamlSource: string) {
  const order = (parse(yamlSource) as { id: string }[]).map((item) => item.id);
  return items.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}

/** profile.yaml 의 main 항목 */
export async function getProfile() {
  const entry = await getEntry('profile', 'main');
  if (!entry) throw new Error('src/content/profile.yaml 에 main 항목이 필요합니다.');
  return entry.data;
}

/** links.yaml 순서 그대로 */
export async function getLinks() {
  return inFileOrder((await getCollection('links')).map((entry) => entry.data), linksYaml);
}

export async function getCareer() {
  return (await getCollection('career')).map((entry) => entry.data);
}

/** media.yaml 순서 그대로, 썸네일(thumb) 포함 */
export async function getMedia() {
  const items = inFileOrder((await getCollection('media')).map((entry) => entry.data), mediaYaml);
  return Promise.all(items.map(async (item) => ({ ...item, thumb: await resolveThumbnail(item) })));
}

export type MediaItem = Awaited<ReturnType<typeof getMedia>>[number];
