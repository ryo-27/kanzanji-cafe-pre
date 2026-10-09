/* 公開前に確定したURL・画像を設定してください。空欄では準備中と表示します。 */
const SITE_CONFIG = {
  reservationUrl: '',
  reservationUrlsByDate: { '14': '', '15': '' },
  instagramUrl: 'https://www.instagram.com/kanzanjipj_shizuokauniversity?stkn=MWNpdDczOWJsMWN1cQ%3D%3D&utm_source=qr',
  email: 'kanzanjipj@gmail.com',
  publicUrl: '',
  images: { hero: 'assets/main.jpg', coffee: 'assets/coffee.jpg', potato: 'assets/potato.jpg', pudding: 'assets/pudding.jpg' }
};

function safeWebUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; }
  catch { return ''; }
}

const bookingLink = document.querySelector('#booking-link');
function updateReservation() {
  const day = document.querySelector('input[name="date"]:checked').value;
  document.querySelector('#selected-day').textContent = `11月${day}日（${day === '14' ? '土' : '日'}）`;
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
  const url = type === 'email' ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : '') : safeWebUrl(SITE_CONFIG.instagramUrl);
  if (url) { link.href = url; link.removeAttribute('aria-disabled'); if (type !== 'email') { link.target = '_blank'; link.rel = 'noopener noreferrer'; } }
});

document.querySelectorAll('a[aria-disabled="true"]').forEach(link => {
  link.addEventListener('click', event => { if (link.getAttribute('aria-disabled') === 'true') event.preventDefault(); });
});

Object.entries(SITE_CONFIG.images).forEach(([key, path]) => {
  if (!path) return;
  const slot = document.querySelector(`[data-image="${key}"]`);
  const img = new Image();
  img.onload = () => { slot.style.backgroundImage = `url(${JSON.stringify(img.src)})`; slot.classList.add('has-image'); slot.setAttribute('aria-label', {hero:'湖上カフェで友達と過ごすイメージ',coffee:'コーヒーのイメージ',potato:'ポテトのイメージ',pudding:'プリンのイメージ'}[key]); };
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

// Reveal each block once as it enters the viewport.
function setupScrollReveal() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll([
    '.experience .section-heading', '.experience-intro', '.experience-grid article',
    '.six-illustration', '.six-copy', '.menu-heading', '.menu-card', '.menu-note',
    '.info-left', '.info-right', '.reservation-inner > div',
    '.faq-section > div', '.about-mark', '.about-copy'
  ].join(', '));

  const reveal = element => {
    element.classList.add('is-visible');
    observer.unobserve(element);
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(element => {
    if (element.matches('.experience-grid article, .menu-card')) {
      const index = [...element.parentElement.children].indexOf(element);
      element.style.setProperty('--reveal-delay', `${index * 90}ms`);
    }
    element.classList.add('scroll-reveal');
    if (element.getBoundingClientRect().top < window.innerHeight - 40) {
      reveal(element);
    } else {
      observer.observe(element);
    }
    element.addEventListener('focusin', () => reveal(element), { once: true });
  });

  reducedMotion.addEventListener('change', event => {
    if (event.matches) {
      targets.forEach(reveal);
      observer.disconnect();
    }
  });
}
setupScrollReveal();
