/* 公開前に確定したURL・画像を設定してください。空欄では準備中と表示します。 */
const SITE_CONFIG = {
  reservationUrl: '',
  reservationUrlsByDate: { '14': '', '15': '' },
  instagramUrl: '',
  xUrl: '',
  email: '',
  publicUrl: '',
  images: { hero: 'assets/hero.jpg', coffee: 'assets/coffee.jpg', potato: 'assets/potato.jpg', pudding: 'assets/pudding.jpg' }
};

function safeWebUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; }
  catch { return ''; }
}

const bookingLink = document.querySelector('#booking-link');
function updateReservation() {
  const day = document.querySelector('input[name="date"]:checked').value;
  document.querySelector('#selected-date').textContent = `11月${day}日（${day === '14' ? '土' : '日'}）／ 開催時間 9:00〜15:00`;
  const url = safeWebUrl(SITE_CONFIG.reservationUrlsByDate[day] || SITE_CONFIG.reservationUrl);
  bookingLink.replaceChildren(document.createTextNode(url ? '予約枠・人数・詳細を確認する ' : '予約ページは準備中 '));
  const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true'); bookingLink.append(arrow);
  if (url) {
    bookingLink.href = url; bookingLink.target = '_blank'; bookingLink.rel = 'noopener noreferrer'; bookingLink.removeAttribute('aria-disabled');
  } else {
    bookingLink.removeAttribute('href'); bookingLink.setAttribute('aria-disabled', 'true');
  }
  document.querySelector('#booking-status').textContent = url ? '外部の予約ページが開きます。希望日・時間・人数を確認してお申し込みください。' : '予約URLが決まり次第、こちらからご案内します。';
}
document.querySelectorAll('input[name="date"]').forEach(input => input.addEventListener('change', updateReservation));
updateReservation();

document.querySelectorAll('[data-contact]').forEach(link => {
  const type = link.dataset.contact;
  const email = SITE_CONFIG.email.trim();
  const url = type === 'email' ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : '') : safeWebUrl(type === 'instagram' ? SITE_CONFIG.instagramUrl : SITE_CONFIG.xUrl);
  if (url) { link.href = url; link.removeAttribute('aria-disabled'); if (type !== 'email') { link.target = '_blank'; link.rel = 'noopener noreferrer'; } }
});
const missingContacts = [...document.querySelectorAll('[data-contact][aria-disabled="true"]')];
document.querySelector('#contact-note').textContent = missingContacts.length ? '未設定のお問い合わせ先は準備中です。' : '開催情報・お問い合わせはこちらから。';

document.querySelectorAll('a[aria-disabled="true"]').forEach(link => {
  link.addEventListener('click', event => { if (link.getAttribute('aria-disabled') === 'true') event.preventDefault(); });
});

Object.entries(SITE_CONFIG.images).forEach(([key, path]) => {
  if (!path) return;
  const slot = document.querySelector(`[data-image="${key}"]`);
  const img = new Image();
  img.onload = () => { slot.style.backgroundImage = `url(${JSON.stringify(img.src)})`; slot.classList.add('has-image'); slot.setAttribute('aria-label', {hero:'湖上カフェで友達と過ごすイメージ（AI生成）',coffee:'コーヒーのイメージ（AI生成）',potato:'ポテトのイメージ（AI生成）',pudding:'プリンのイメージ（AI生成）'}[key]); };
  img.src = path;
});

document.querySelector('#share-button').addEventListener('click', async () => {
  const status = document.querySelector('#share-status');
  const publicUrl = safeWebUrl(SITE_CONFIG.publicUrl);
  const isLocal = location.protocol === 'file:' || ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  const url = publicUrl || (isLocal ? '' : location.href.split('#')[0]);
  const text = '11/14・15、舘山寺で2日間限定の湖上カフェ！友達と浜名湖の上でコーヒーとおやつを楽しもう。';
  const data = { title: 'LAKE FLOAT CAFÉ in Kanzanji', text, ...(url ? { url } : {}) };
  try {
    if (navigator.share && url) { await navigator.share(data); status.textContent = 'シェア画面を開きました。'; return; }
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(`${text}${url ? '\n'+url : ''}`); status.textContent = url ? '紹介文とページURLをコピーしました。' : '紹介文をコピーしました。公開後にページURLも添えてください。'; return; }
  } catch (error) { if (error.name === 'AbortError') return; }
  const area = document.querySelector('#share-text'); area.value = `${text}${url ? '\n'+url : '\n（公開後のページURLを添えてください）'}`;
  document.querySelector('#share-dialog').showModal(); area.focus(); area.select();
});
