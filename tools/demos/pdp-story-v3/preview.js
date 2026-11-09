const frame = document.getElementById('preview');
const workspace = document.getElementById('workspace');
const params = new URLSearchParams(location.search);
let selectedProduct = params.get('product') === 'a20' ? 'a20' : 'g31';
let device = params.get('device') === 'mobile' ? 'mobile' : 'desktop';
const notes = {a20: 'A20 · 已移除 Overview；购买区文案沿用上一版。', g31: 'G31 · 删除 Overview；价格上方使用自有亚马逊五点的精简版。'};
function updateShell(updateFrame = false) {
  document.querySelectorAll('[data-product]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.product === selectedProduct)));
  document.querySelectorAll('[data-device]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.device === device)));
  workspace.classList.toggle('is-mobile', device === 'mobile');
  document.getElementById('preview-note').textContent = notes[selectedProduct];
  document.getElementById('standalone').href = `product.html?product=${selectedProduct}`;
  history.replaceState(null, '', `?product=${selectedProduct}&device=${device}`);
  if (updateFrame) frame.src = `product.html?product=${selectedProduct}`;
}
document.querySelectorAll('[data-product]').forEach(el => el.addEventListener('click', () => {selectedProduct = el.dataset.product; updateShell(true);}));
document.querySelectorAll('[data-device]').forEach(el => el.addEventListener('click', () => {
  device = el.dataset.device; updateShell();
  requestAnimationFrame(() => frame.contentWindow.postMessage({type: 'suntneew-demo-top'}, location.origin));
}));
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.type !== 'suntneew-demo-product') return;
  if (['a20', 'g31'].includes(event.data.product)) {selectedProduct = event.data.product; updateShell();}
});
updateShell(selectedProduct !== 'g31');
