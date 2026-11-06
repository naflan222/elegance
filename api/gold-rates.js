// Optional Vercel endpoint: a server-side request avoids provider CORS limits.
module.exports = async function handler(req, res) {
  try {
    const upstream=await fetch('https://www.goldpricetoday.lk/api/v1/gold-price',{signal:AbortSignal.timeout(10000)});
    if(!upstream.ok) throw new Error('Provider unavailable');
    const data=await upstream.json();
    const age=Date.now()-Date.parse(data.as_of);
    if(data.status!=='ok'||data.currency!=='LKR'||!Number.isFinite(age)||age < -300000||age>36*3600000||!['22k','24k'].every(k=>['per_gram','per_8g'].every(u=>Number.isFinite(data.prices?.[k]?.[u])&&data.prices[k][u]>0)))throw new Error('Invalid reference');
    res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=600');
    res.status(200).json(data);
  }catch {res.status(503).json({status:'unavailable'});}
};
