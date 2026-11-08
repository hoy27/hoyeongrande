import { getCollection, getEntry } from 'astro:content';

/** profile.yaml 의 main 항목 */
export async function getProfile() {
  const entry = await getEntry('profile', 'main');
  if (!entry) throw new Error('src/content/profile.yaml 에 main 항목이 필요합니다.');
  return entry.data;
}

/** links.yaml 순서 그대로 */
export async function getLinks() {
  return (await getCollection('links')).map((entry) => entry.data);
}

export async function getCareer() {
  return (await getCollection('career')).map((entry) => entry.data);
}
