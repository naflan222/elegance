(() => {
  'use strict';
  const designs = [
  [
    "floral-pendant",
    "Floral Gold Pendant"
  ],
  [
    "bridal-necklace",
    "Bridal Gold Necklace"
  ],
  [
    "jhumka-earrings",
    "Gold Jhumka Earrings"
  ],
  [
    "wedding-bands",
    "Classic Wedding Bands"
  ],
  [
    "gold-bangles",
    "Traditional Gold Bangles"
  ],
  [
    "sapphire-ring",
    "Blue Sapphire Ring"
  ],
  [
    "emerald-pendant",
    "Emerald Gold Pendant"
  ],
  [
    "ruby-ring",
    "Ruby Halo Ring"
  ],
  [
    "pearl-earrings",
    "Pearl Drop Earrings"
  ],
  [
    "gold-bracelet",
    "Floral Link Gold Bracelet"
  ]
];
  const wa = 'https://wa.me/94770777998?text=';
  const params = new URLSearchParams(location.search);
  const selected = designs.find(d => d[0] === params.get('design')) || designs[0];
  document.querySelectorAll('[data-design-title]').forEach(e => e.textContent = selected[1]);
  document.querySelectorAll('[data-design-enquiry]').forEach(e => e.href = wa + encodeURIComponent('Hello Elegance, I would like to enquire about the '+selected[1]+' design. Please send actual item photos, availability and a quotation.'));
  document.querySelectorAll('[data-design-image]').forEach(image => {
    image.src = 'assets/img/elegance/' + selected[0] + '.webp';
    image.alt = selected[1] + ' — illustrative design with Elegance branding';
  });
  if (document.querySelector('[data-design-title]')) document.title = selected[1] + ' | Elegance Gem & Jewelers';
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
  const cards = [...document.querySelectorAll('[data-product]')];
  const query = (params.get('q') || '').trim().slice(0, 120).toLowerCase();
  if (/shop(?:-sidebar)?\.html$/.test(location.pathname)) {
    const filters = [...document.querySelectorAll('.catalog-category')];
    const sorts = [...document.querySelectorAll('.orderby')];
    let category = params.get('category') || '';
    let order = params.get('orderby') === 'name' ? 'name' : 'default';
    function renderCatalog() {
      const visible = new Set();
      cards.forEach(card => {
        const match = (!query || query.split(/\s+/).every(word => card.textContent.toLowerCase().includes(word))) &&
          (!category || card.dataset.product === category || card.dataset.category === category);
        card.parentElement.hidden = !match;
        if (match) visible.add(card.dataset.product);
      });
      const count = visible.size;
      document.querySelectorAll('.woocommerce-result-count').forEach(e => e.textContent = count + ' jewellery design' + (count === 1 ? '' : 's'));
      document.querySelectorAll('.search-feedback').forEach(e => {
        e.textContent = !count ? 'No matching designs. Try another collection or search, or contact us for help.' :
          query ? 'Designs matching “' + query + '”.' : '';
      });
      document.querySelectorAll('#myTabContent > .tab-pane > .row').forEach(row => {
        [...row.children].sort((a, b) => {
          const idA = a.querySelector('[data-product]').dataset.product;
          const idB = b.querySelector('[data-product]').dataset.product;
          return order === 'name' ? designs.find(d => d[0] === idA)[1].localeCompare(designs.find(d => d[0] === idB)[1]) :
            designs.findIndex(d => d[0] === idA) - designs.findIndex(d => d[0] === idB);
        }).forEach(el => row.append(el));
      });
    }
    function rememberFilters() {
      const url = new URL(location.href);
      category ? url.searchParams.set('category', category) : url.searchParams.delete('category');
      order === 'name' ? url.searchParams.set('orderby', order) : url.searchParams.delete('orderby');
      history.replaceState(null, '', url);
    }
    filters.forEach(select => {
      select.value = [...select.options].some(o => o.value === category) ? category : '';
      select.addEventListener('change', () => { category = select.value; renderCatalog(); rememberFilters(); });
    });
    sorts.forEach(select => {
      select.value = order;
      select.addEventListener('change', () => { order = select.value; renderCatalog(); rememberFilters(); });
    });
    renderCatalog();
  }
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

