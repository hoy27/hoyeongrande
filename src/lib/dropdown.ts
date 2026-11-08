// <details data-dropdown> 공통 동작: 햄버거 메뉴, 언어 선택
// - 바깥을 누르거나 Esc 를 누르면 닫힘
// - 안의 링크를 누르면 닫힘 (같은 페이지 #앵커 이동 후 메뉴가 남지 않게)
// - 하나를 열면 다른 것은 닫힘

export function setupDropdowns() {
  const dropdowns = [...document.querySelectorAll<HTMLDetailsElement>('details[data-dropdown]')];
  const closeAll = (except?: HTMLDetailsElement) =>
    dropdowns.forEach((d) => {
      if (d !== except) d.open = false;
    });

  dropdowns.forEach((dropdown) => {
    dropdown.addEventListener('toggle', () => {
      if (dropdown.open) closeAll(dropdown);
    });
    dropdown.querySelectorAll('a').forEach((link) =>
      link.addEventListener('click', () => {
        dropdown.open = false;
      }),
    );
  });

  document.addEventListener('click', (event) => {
    const target = event.target as Node;
    dropdowns.forEach((d) => {
      if (d.open && !d.contains(target)) d.open = false;
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const open = dropdowns.find((d) => d.open);
    if (!open) return;
    open.open = false;
    open.querySelector('summary')?.focus();
  });
}
