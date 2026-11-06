from pathlib import Path
import shutil
root = Path(__file__).resolve().parents[1]
out = root/'dist'
out.mkdir(exist_ok=True)
for file in root.glob('*.html'):shutil.copy2(file,out/file.name)
for name in ('assets','data'):
 shutil.copytree(root/name,out/name,dirs_exist_ok=True)
