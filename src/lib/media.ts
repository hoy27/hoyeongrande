// Media 썸네일을 영상·음원 주소에서 자동으로 가져온다 (빌드 때 한 번).
// media.yaml 에 thumbnail 을 직접 적으면 그 이미지를 우선 쓴다.

import type { ImageMetadata } from 'astro';

type Platform = 'youtube' | 'soundcloud';
export type Thumbnail = ImageMetadata | string | undefined;

/** youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, /live/ID */
export function youtubeId(url: string) {
  const u = new URL(url);
  if (u.hostname === 'youtu.be') return u.pathname.slice(1) || undefined;
  if (u.searchParams.get('v')) return u.searchParams.get('v') ?? undefined;
  const match = u.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]+)/);
  return match?.[1];
}

async function youtubeThumbnail(url: string) {
  const id = youtubeId(url);
  if (!id) throw new Error(`media.yaml: 유튜브 영상 주소에서 영상 ID를 찾을 수 없습니다 (${url})`);
  // 고화질(1280x720)이 없는 영상도 있어서, 고화질 → 기본(480x360) 순서로 찾는다.
  // 둘 다 없으면(삭제·비공개·주소 오타) undefined → 아이콘으로 대신 보여준다.
  for (const size of ['maxresdefault', 'hqdefault']) {
    const thumb = `https://i.ytimg.com/vi/${id}/${size}.jpg`;
    const res = await fetch(thumb, { method: 'HEAD' });
    if (res.ok) return thumb;
  }
  console.warn(`[media] 유튜브 썸네일이 없습니다 (영상이 삭제·비공개됐거나 주소가 틀렸을 수 있음): ${url}`);
  return undefined;
}

async function soundcloudThumbnail(url: string) {
  const res = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`);
  if (!res.ok) {
    console.warn(`[media] 사운드클라우드 썸네일이 없습니다 (트랙이 삭제·비공개됐거나 주소가 틀렸을 수 있음): ${url}`);
    return undefined;
  }
  const data = (await res.json()) as { thumbnail_url?: string };
  return data.thumbnail_url;
}

const cache = new Map<string, Promise<string | undefined>>();

/** 썸네일을 못 가져오면(네트워크 오류 등) 빌드는 계속하고 썸네일 없이 보여준다 */
export function resolveThumbnail(item: { platform: Platform; url: string; thumbnail?: ImageMetadata }): Promise<Thumbnail> {
  if (item.thumbnail) return Promise.resolve(item.thumbnail);
  if (!cache.has(item.url)) {
    const lookup = item.platform === 'youtube' ? youtubeThumbnail(item.url) : soundcloudThumbnail(item.url);
    cache.set(
      item.url,
      lookup.catch((error: unknown) => {
        if (error instanceof Error && error.message.startsWith('media.yaml')) throw error;
        console.warn(`[media] 썸네일을 가져오지 못했습니다: ${item.url}`);
        return undefined;
      }),
    );
  }
  return cache.get(item.url)!;
}
