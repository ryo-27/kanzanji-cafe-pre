/* 公開前に確定したURL・画像を設定してください。空欄では準備中と表示します。 */
const SITE_CONFIG = {
  reservationUrl: 'https://t-dv.com/LakeFloatCafeinKanzanji',
  instagramUrl: 'https://www.instagram.com/kanzanjipj_shizuokauniversity?stkn=MWNpdDczOWJsMWN1cQ%3D%3D&utm_source=qr',
  email: 'kanzanjipj@gmail.com',
  publicUrl: '',
  images: { hero: 'assets/main.jpg', coffee: 'assets/coffee.jpg', pudding: 'assets/pudding.jpg', chestnutPie: 'assets/chestnut-pie.jpg', sweetPotato: 'assets/sweet-potato.jpg' }
};

function safeWebUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; }
  catch { return ''; }
}

const bookingLink = document.querySelector('#booking-link');
function setupReservation() {
  const url = safeWebUrl(SITE_CONFIG.reservationUrl);
  bookingLink.replaceChildren(document.createTextNode(url ? 'TicketDiveで予約する ' : '予約ページは準備中 '));
  const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true'); bookingLink.append(arrow);
  if (url) {
    bookingLink.href = url; bookingLink.target = '_blank'; bookingLink.rel = 'noopener noreferrer'; bookingLink.removeAttribute('aria-disabled');
  } else {
    bookingLink.removeAttribute('href'); bookingLink.setAttribute('aria-disabled', 'true');
  }
}
setupReservation();

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
  if (!slot) return;
  const img = new Image();
  img.onload = () => { slot.style.backgroundImage = `url(${JSON.stringify(img.src)})`; slot.classList.add('has-image'); slot.setAttribute('aria-label', {hero:'湖上カフェで大切な人と過ごすイメージ',coffee:'コーヒーのイメージ',pudding:'プリンのイメージ',chestnutPie:'和栗パイのイメージ',sweetPotato:'カットしたさつまいものイメージ'}[key]); };
  img.src = path;
});

document.querySelector('#share-button').addEventListener('click', async () => {
  const status = document.querySelector('#share-status');
  const publicUrl = safeWebUrl(SITE_CONFIG.publicUrl);
  const isLocal = location.protocol === 'file:' || ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  const url = publicUrl || (isLocal ? '' : location.href.split('#')[0]);
  const text = '湖上で過ごす、特別な体験。11/14・15、舘山寺で2日間限定の「Lake Float Cafe in Kanzanji」。大切な人と浜名湖の上で特別な時間を。9:00〜15:00、各回1時間制。予備日：11/21・22（天候による対応の詳細は決まり次第ご案内します）。';
  const data = { title: 'Lake Float Cafe in Kanzanji', text, ...(url ? { url } : {}) };
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
