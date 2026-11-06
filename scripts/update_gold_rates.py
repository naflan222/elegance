"""Fetch a validated Sri Lankan gold reference; retain the last good file on failure."""
import json, math, os, tempfile
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.request import Request, urlopen

SOURCE = 'https://www.goldpricetoday.lk/api/v1/gold-price'
DEST = Path(__file__).resolve().parents[1] / 'data/gold-rates.json'

def validate(data):
    if data.get('status') != 'ok' or data.get('currency') != 'LKR':
        raise ValueError('Provider did not return an LKR gold reference')
    as_of = datetime.fromisoformat(data['as_of'].replace('Z', '+00:00'))
    if as_of.tzinfo is None:
        raise ValueError('Provider timestamp must include a timezone')
    age = datetime.now(timezone.utc) - as_of
    if age < -timedelta(minutes=5) or age > timedelta(hours=36):
        raise ValueError('Provider timestamp is not current')
    for karat in ('22k', '24k'):
        row = data['prices'][karat]
        for unit in ('per_gram', 'per_8g'):
            value = row[unit]
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not 1000 < value < 10000000:
                raise ValueError('Invalid gold reference value')
        if abs(row['per_8g'] - row['per_gram'] * 8) > 1:
            raise ValueError('Inconsistent gram and pawn values')
    if data['prices']['22k']['per_gram'] >= data['prices']['24k']['per_gram']:
        raise ValueError('Inconsistent purity prices')
    return data

def update():
    req = Request(SOURCE, headers={'User-Agent':'Elegance-Gold-Reference/1.0','Accept':'application/json'})
    with urlopen(req, timeout=30) as response:
        data = validate(json.load(response))
    data['fetched_at'] = datetime.now(timezone.utc).isoformat()
    data['provider_url'] = 'https://www.goldpricetoday.lk/'
    DEST.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile('w', dir=DEST.parent, delete=False) as temp:
        json.dump(data, temp, indent=2, ensure_ascii=False)
        temp.write('\n')
        temp_path = temp.name
    os.replace(temp_path, DEST)
    print('Updated gold reference. Source timestamp: '+data['as_of'])

if __name__ == '__main__':
    update()
