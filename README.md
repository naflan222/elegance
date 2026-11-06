# Elegance Gem & Jewelers

95 Main Street, Tangalle, Sri Lanka · 077 077 7998 · elegancejewellers0@gmail.com

This website retains the supplied template layout, original CSS, typography and animations. Updated pages, transparent web logo and branded jewellery images are included. Product photographs are AI-generated illustrative designs; the website asks customers to request actual item photographs and quotations.

## Hosting

Upload these files to the repository root. For Vercel use Framework Preset Other, no build command and the repository root as the output directory. The api/gold-rates.js server endpoint supplies fresh indicative LKR references for 22K and 24K. On PHP or other static hosts, the daily GitHub feed can be used instead.

## Daily reference updater

.github/workflows/update-gold-rates.yml fetches validated reference data at 09:00 and 15:00 Asia/Colombo. It runs initially when the updater or workflow is pushed. GitHub schedules may be delayed; inactive public repositories may have schedules disabled by GitHub. The workflow runs when its configuration is pushed, and automatically on the schedules above.

The rate source is https://www.goldpricetoday.lk/api/v1/gold-price, an indicative international spot-gold conversion to LKR. It is NOT Elegance's selling price or an official fixed nationwide retail rate. The website displays the source timestamp and clearly labels older or saved data. Making charges, stones and margins must be quoted by the shop.

Contact forms open WhatsApp with a prepared enquiry; visitors review and send the message themselves. No checkout or online payment is configured.

Run python -m unittest discover -s tests for feed validation checks. No dependencies are needed for the updater.
