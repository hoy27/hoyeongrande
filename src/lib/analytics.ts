// 브라우저에서 실행된다. GA 가 없으면(로컬 개발, 측정 ID 미설정) 아무것도 하지 않는다.

type GtagParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (command: 'event', name: string, params?: GtagParams) => void;
  }
}

export function track(name: string, params: GtagParams = {}) {
  // GA4 는 기본적으로 sendBeacon 으로 보내서, 외부 링크로 페이지를 떠나도 이벤트가 유실되지 않는다.
  window.gtag?.('event', name, params);
}

/**
 * data 속성이 붙은 요소의 클릭을 한 곳에서 기록한다.
 * - data-link-id="instagram"     → link_click { link_id, page, lang }
 * - data-contact="email"         → contact_click { method }
 * - data-lang-switch="en"        → lang_switch { from, to }
 */
export function setupClickTracking() {
  const page = document.documentElement.dataset.page ?? '';
  const lang = document.documentElement.lang;

  document.addEventListener('click', (event) => {
    const target = (event.target as Element | null)?.closest<HTMLElement>(
      '[data-link-id], [data-contact], [data-lang-switch]',
    );
    if (!target) return;

    const { linkId, contact, langSwitch } = target.dataset;
    if (linkId) track('link_click', { link_id: linkId, page, lang });
    else if (contact) track('contact_click', { method: contact });
    else if (langSwitch) track('lang_switch', { from: lang, to: langSwitch });
  });
}
