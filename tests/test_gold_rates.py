import copy, importlib.util, json, unittest
from datetime import datetime, timezone, timedelta
from pathlib import Path
spec=importlib.util.spec_from_file_location('rates',Path(__file__).parents[1]/'scripts/update_gold_rates.py')
rates=importlib.util.module_from_spec(spec);spec.loader.exec_module(rates)
class ReferenceValidation(unittest.TestCase):
 def setUp(self):
  self.data=json.loads((Path(__file__).parents[1]/'data/gold-rates.json').read_text())
  self.data['as_of']=datetime.now(timezone.utc).isoformat()
 def test_valid_feed(self):self.assertIs(rates.validate(self.data),self.data)
 def test_stale_rejected(self):
  self.data['as_of']=(datetime.now(timezone.utc)-timedelta(days=3)).isoformat()
  with self.assertRaises(ValueError):rates.validate(self.data)
 def test_nonfinite_rejected(self):
  self.data['prices']['22k']['per_gram']=float('nan')
  with self.assertRaises(ValueError):rates.validate(self.data)
 def test_mismatched_pawn_rejected(self):
  self.data['prices']['24k']['per_8g']+=100
  with self.assertRaises(ValueError):rates.validate(self.data)
if __name__=='__main__':unittest.main()
