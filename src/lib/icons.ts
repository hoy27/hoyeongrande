import {
  siApplemusic,
  siBandcamp,
  siInstagram,
  siMixcloud,
  siSoundcloud,
  siSpotify,
  siTiktok,
  siX,
  siYoutube,
} from 'simple-icons';

/** links.yaml 의 icon 에 쓸 수 있는 이름. 새 아이콘은 여기에 추가한다. */
export const ICON_NAMES = [
  'instagram',
  'soundcloud',
  'youtube',
  'mixcloud',
  'spotify',
  'applemusic',
  'bandcamp',
  'tiktok',
  'x',
  'email',
  'file',
  'link',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

// 24x24 viewBox 기준 path. 브랜드 아이콘은 Simple Icons(빌드 때만 사용, 번들에 안 들어감).
const paths: Record<IconName, string> = {
  instagram: siInstagram.path,
  soundcloud: siSoundcloud.path,
  youtube: siYoutube.path,
  mixcloud: siMixcloud.path,
  spotify: siSpotify.path,
  applemusic: siApplemusic.path,
  bandcamp: siBandcamp.path,
  tiktok: siTiktok.path,
  x: siX.path,
  email:
    'M2 4h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v.4l10 6.25L22 6.4V6H2Zm20 2.75-9.47 5.92a1 1 0 0 1-1.06 0L2 8.75V18h20V8.75Z',
  file: 'M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1.5V8h4.5L13 3.5ZM6 4v16h12V10h-6V4H6Zm2 9h8v2H8v-2Zm0 4h8v2H8v-2Z',
  link: 'M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0ZM7.05 20.5a4.5 4.5 0 0 1-3.18-7.68l2.83-2.83a1 1 0 1 1 1.41 1.41l-2.83 2.83a2.5 2.5 0 0 0 3.54 3.54l2.83-2.83a1 1 0 1 1 1.41 1.41l-2.83 2.83a4.47 4.47 0 0 1-3.18 1.32Zm9.66-6.2a1 1 0 0 1-.7-1.71l2.82-2.83a2.5 2.5 0 0 0-3.53-3.54l-2.83 2.83a1 1 0 1 1-1.41-1.41l2.83-2.83a4.5 4.5 0 0 1 6.36 6.36l-2.83 2.83a1 1 0 0 1-.71.3Z',
};

export function iconPath(name: IconName) {
  return paths[name];
}
