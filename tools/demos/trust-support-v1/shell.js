const frame = document.getElementById('preview');
const workspace = document.getElementById('workspace');
const toolbar = document.getElementById('toolbar');
const labels = {product: '01 / 购买保障', support: '02 / 售后申请', resources: '03 / 型号支持'};
const captions = {product: '点开保障卡片，再试试「Get product support」。', support: '选择问题类型，填写测试内容，可预览申请；不会发送。', resources: '试试快速上手与故障排查，再进入售后。'};
function selectRoute(route, notifyFrame = true) {
  if (!labels[route]) return;
  document.querySelectorAll('[data-route]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.route === route)));
  document.getElementById('screen-label').textContent = labels[route];
  document.getElementById('caption').textContent = captions[route];
  document.querySelector('.standalone').href = `site.html#${route}`;
  window.scrollTo({top: 0, behavior: 'instant'});
  if (notifyFrame) frame.contentWindow.postMessage({type: 'suntneew-route', route}, location.origin);
}
document.querySelectorAll('[data-route]').forEach(button => button.addEventListener('click', () => selectRoute(button.dataset.route)));
document.querySelectorAll('[data-device]').forEach(button => button.addEventListener('click', () => {
  const desktop = button.dataset.device === 'desktop';
  workspace.classList.toggle('is-desktop', desktop);
  toolbar.classList.toggle('wide', desktop);
  document.querySelectorAll('[data-device]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.getElementById('size-label').textContent = desktop ? 'RESPONSIVE · DESKTOP' : '416 PX · MOBILE';
  window.scrollTo({top: 0, behavior: 'instant'});
  const route = document.querySelector('.routes [aria-pressed="true"]').dataset.route;
  requestAnimationFrame(() => frame.contentWindow.postMessage({type: 'suntneew-route', route}, location.origin));
}));
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.data?.type !== 'suntneew-route-changed') return;
  selectRoute(event.data.route, false);
});
