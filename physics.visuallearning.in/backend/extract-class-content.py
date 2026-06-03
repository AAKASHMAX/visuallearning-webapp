# -*- coding: utf-8 -*-
"""Parse Physics_Videos_Collection.xlsx -> physics-class-content.json
Classes 11 & 12, all chapters in order, Vimeo videos (Hindi + English).
Empty chapters (no Vimeo) are kept with an empty video list."""
import openpyxl, re, json

XLSX = r'N:\Main data\DataSheet\Physics_Videos_Collection.xlsx'
OUT = r'C:\Users\aakash123\visuallearning-app\physics.visuallearning.in\backend\physics-class-content.json'

chapter_re = re.compile(r'CLASS\s*(\d+)\s*-\s*CHAPTER\s*[\d.]*\s*:\s*(.*)', re.I)
vimeo_re = re.compile(r'vimeo\.com/(\d+)')

# Canonical NCERT chapter names (sheet headers are truncated). Order matches the sheet.
CANONICAL = {
    '11': [
        "Physical World and Measurement", "Units and Measurements", "Motion in a Straight Line",
        "Motion in a Plane", "Laws of Motion", "Work, Energy and Power",
        "System of Particles and Rotational Motion", "Gravitation", "Mechanical Properties of Solids",
        "Mechanical Properties of Fluids", "Thermal Properties of Matter", "Thermodynamics",
        "Kinetic Theory", "Oscillations", "Waves",
    ],
    '12': [
        "Electric Charges and Fields", "Electrostatic Potential and Capacitance", "Current Electricity",
        "Moving Charges and Magnetism", "Magnetism and Matter", "Electromagnetic Induction",
        "Alternating Current", "Electromagnetic Waves", "Ray Optics and Optical Instruments",
        "Wave Optics", "Dual Nature of Radiation and Matter", "Atoms", "Nuclei",
        "Semiconductor Electronics",
    ],
}

def clean_chapter(name: str) -> str:
    # strip leading "N." / "N " numbering
    name = re.sub(r'^\s*\d+\s*[.\)]?\s*', '', name).strip()
    # strip stray trailing single-letter marker (" E" / " H") from the sheet
    name = re.sub(r'\s+[EH]$', '', name).strip()
    return name

def vimeo_url(raw):
    if not raw:
        return None
    m = vimeo_re.search(str(raw))
    return f'https://vimeo.com/{m.group(1)}' if m else None

wb = openpyxl.load_workbook(XLSX, data_only=True)
ws = wb.active
rows = list(ws.iter_rows(values_only=True))

data = {'11': [], '12': []}
cur_cls = None
cur_chapter = None

for r in rows:
    a = str(r[0]).strip() if r[0] else ''
    m = chapter_re.search(a)
    if m:
        cls = m.group(1)
        cur_cls = cls if cls in data else None
        if cur_cls:
            cur_chapter = {'name': clean_chapter(m.group(2)), 'videos': []}
            data[cur_cls].append(cur_chapter)
        continue
    if not cur_cls or not a or a.upper() == 'TOPIC':
        continue
    h = vimeo_url(r[3])
    e = vimeo_url(r[4])
    if not h and not e:
        continue  # Vimeo-only: skip videos with no Vimeo link
    cur_chapter['videos'].append({'title': a, 'hindi': h, 'english': e})

# Replace truncated sheet names with canonical names (order matches).
for cls, names in CANONICAL.items():
    chs = data.get(cls, [])
    if len(chs) == len(names):
        for i, ch in enumerate(chs):
            ch['name'] = names[i]
    else:
        print(f"WARN class {cls}: {len(chs)} chapters but {len(names)} canonical names — names NOT overridden")

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

for cls in ('11', '12'):
    chs = data[cls]
    vids = sum(len(c['videos']) for c in chs)
    hi = sum(1 for c in chs for v in c['videos'] if v['hindi'])
    en = sum(1 for c in chs for v in c['videos'] if v['english'])
    empty = sum(1 for c in chs if not c['videos'])
    print(f'Class {cls}: {len(chs)} chapters ({empty} empty) | {vids} source videos -> {hi} Hindi + {en} English rows')
print('wrote', OUT)
