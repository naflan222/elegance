(() => {
  'use strict';
  const designs = [
    ['floral-pendant', 'Floral Gold Pendant'], ['bridal-necklace', 'Bridal Gold Necklace'],
    ['jhumka-earrings', 'Gold Jhumka Earrings'], ['wedding-bands', 'Classic Wedding Bands'],
    ['gold-bangles', 'Traditional Gold Bangles'], ['sapphire-ring', 'Blue Sapphire Ring']
  ];
  const wa = 'https://wa.me/94770777998?text=';
  const params = new URLSearchParams(location.search);
  const selected = designs.find(d => d[0] === params.get('design')) || designs[0];
  document.querySelectorAll('[data-design-title]').forEach(e => e.textContent = selected[1]);
  document.querySelectorAll('[data-design-enquiry]').forEach(e => e.href = wa + encodeURIComponent('Hello Elegance, I would like to enquire about the '+selected[1]+' design. Please send actual item photos, availability and a quotation.'));
  if (document.querySelector('[data-design-title]')) document.querySelectorAll('img[src*="elegance/floral-pendant"]').forEach(e => { if (!e.closest('[data-product]')) {e.src='assets/img/elegance/'+selected[0]+'.webp';e.alt=selected[1]+' — illustrative design';} });
  document.querySelectorAll('[data-enquiry-form],[data-contact-enquiry]').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    let message = 'Hello Elegance, ';
    if (form.hasAttribute('data-contact-enquiry')) {
      message += ['Name: '+[data.get('name'),data.get('last_name')].filter(Boolean).join(' '), data.get('email') && 'Email: '+data.get('email'),data.get('phone') && 'Phone: '+data.get('phone'),data.get('message')].filter(Boolean).join('\n');
    } else message += data.get('text') || 'I would like to enquire about your jewellery.';
    location.href = wa + encodeURIComponent(message);
  }));
  document.querySelectorAll('.product-action__btn').forEach((button,i) => {
    const card=button.closest('[data-product]'); if(!card) return;
    button.setAttribute('aria-label',i%2 ? 'View jewellery design' : 'Enquire about jewellery design');
    button.addEventListener('click',()=> location.href='shop-details.html?design='+encodeURIComponent(card.dataset.product));
  });
  const cards=[...document.querySelectorAll('[data-product]')];
  const query=(params.get('q')||'').trim().slice(0,120).toLowerCase();
  const category=params.get('category');
  if (/shop(?:-sidebar)?\.html$/.test(location.pathname) && (query||category)) {
    let count=0;
    cards.forEach(card=>{const match=(!query||card.textContent.toLowerCase().includes(query))&&(!category||card.dataset.product===category);card.parentElement.hidden=!match;if(match) count++;});
    document.querySelectorAll('.search-feedback').forEach(e=>e.textContent=count?'Designs matching your search.':'No matching designs. Try “gold”, “ring”, “necklace” or contact us for help.');
  }
  document.querySelectorAll('.orderby').forEach(select=>select.addEventListener('change',()=>{
    document.querySelectorAll('#myTabContent > .tab-pane > .row').forEach(row=>{
      [...row.children].sort((a,b)=>select.value==='name'?a.textContent.trim().localeCompare(b.textContent.trim()):designs.findIndex(d=>d[0]===a.querySelector('[data-product]')?.dataset.product)-designs.findIndex(d=>d[0]===b.querySelector('[data-product]')?.dataset.product)).forEach(el=>row.append(el));
    });
  }));
  // Rates are fetched by the repository's daily job. The public JSON feed keeps
  // static deployments current without exposing API credentials or relying on CORS at the provider.
  const rateBlocks=[...document.querySelectorAll('[data-gold-rates]')];
  if (!rateBlocks.length) return;
  const money=new Intl.NumberFormat('en-LK',{style:'currency',currency:'LKR',minimumFractionDigits:2});
  let refreshing=false;
  function valid(data){
    const time=Date.parse(data.as_of), age=Date.now()-time;
    return data.currency==='LKR' && Number.isFinite(time) && age>=-300000 && ['22k','24k'].every(k=>['per_gram','per_8g'].every(unit=>Number.isFinite(data.prices?.[k]?.[unit])&&data.prices[k][unit]>0));
  }
  function render(data, fallback){
    document.querySelectorAll('[data-rate]').forEach(el=>el.textContent=money.format(data.prices[el.dataset.rate][el.dataset.unit]));
    const age=Date.now()-Date.parse(data.as_of);
    const stale=age>36*60*60*1000;
    const date=new Intl.DateTimeFormat('en-LK',{timeZone:'Asia/Colombo',dateStyle:'medium',timeStyle:'short'}).format(new Date(data.as_of));
    document.querySelectorAll('[data-gold-status]').forEach(el=>{
      el.dataset.stale=String(stale||fallback);
      el.textContent=(stale?'Older reference — ':fallback?'Saved reference — ':'Latest published reference — ')+'Source updated '+date+' (Sri Lanka time).'+(stale?' A fresh rate is currently unavailable. Contact us to confirm.':fallback?' Could not check for a newer update.':' Refreshed automatically each day.');
    });
  }
  async function fetchJSON(url){const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(12000)});if(!response.ok)throw new Error('Feed unavailable');const data=await response.json();if(!valid(data))throw new Error('Invalid feed');return data;}
  async function refresh(){
    if(refreshing)return;refreshing=true;
    document.querySelectorAll('.gold-refresh').forEach(b=>b.disabled=true);
    try {
      // An optional same-origin endpoint gives Vercel deployments a current market reference.
      let data;
      try {data=await fetchJSON('api/gold-rates');}
      catch {data=await fetchJSON('https://raw.githubusercontent.com/naflan222/elegance/main/data/gold-rates.json?ts='+Math.floor(Date.now()/300000));}
      render(data,false);
    } catch {
      try {render(await fetchJSON('data/gold-rates.json'),true);}
      catch {document.querySelectorAll('[data-gold-status]').forEach(e=>e.textContent='Gold rates are temporarily unavailable. Please call 077 077 7998 for a current quotation.');document.querySelectorAll('[data-rate]').forEach(e=>e.textContent='Unavailable');}
    } finally {refreshing=false;document.querySelectorAll('.gold-refresh').forEach(b=>b.disabled=false);}
  }
  refresh();document.querySelectorAll('.gold-refresh').forEach(b=>b.addEventListener('click',refresh));
  setInterval(()=>{if(!document.hidden)refresh();},15*60*1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();
