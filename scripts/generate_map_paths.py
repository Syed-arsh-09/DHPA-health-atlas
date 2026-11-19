import json
import math
import os
import re
from difflib import get_close_matches

# Load files
with open('frontend/public/maps/india_districts.json', 'r', encoding='utf-8') as f:
    geo = json.load(f)

with open('frontend/src/data/districts.json', 'r', encoding='utf-8') as f:
    dhpa_districts = json.load(f)

with open('frontend/src/data/metadata.json', 'r', encoding='utf-8') as f:
    metadata = json.load(f)

# Albers projection setup for India
phi1 = math.radians(12.0)
phi2 = math.radians(28.0)
phi0 = math.radians(24.0)
lambda0 = math.radians(78.5)

n = 0.5 * (math.sin(phi1) + math.sin(phi2))
C = math.cos(phi1)**2 + 2 * n * math.sin(phi1)
rho0 = math.sqrt(C - 2 * n * math.sin(phi0)) / n

def project_raw(lon, lat):
    phi = math.radians(lat)
    lambda_ = math.radians(lon)
    term = C - 2 * n * math.sin(phi)
    rho = math.sqrt(max(0.0, term)) / n
    theta = n * (lambda_ - lambda0)
    x = rho * math.sin(theta)
    y = rho0 - rho * math.cos(theta)
    return x, y

# Find bounding box across all points
raw_min_x, raw_max_x = 1e9, -1e9
raw_min_y, raw_max_y = 1e9, -1e9

def scan_pts(coords):
    global raw_min_x, raw_max_x, raw_min_y, raw_max_y
    if isinstance(coords[0], (int, float)):
        x, y = project_raw(coords[0], coords[1])
        raw_min_x = min(raw_min_x, x)
        raw_max_x = max(raw_max_x, x)
        raw_min_y = min(raw_min_y, y)
        raw_max_y = max(raw_max_y, y)
    else:
        for c in coords:
            scan_pts(c)

for feat in geo['features']:
    scan_pts(feat['geometry']['coordinates'])

width = 800
height = 880
padding = 24

scale_x = (width - 2 * padding) / (raw_max_x - raw_min_x)
scale_y = (height - 2 * padding) / (raw_max_y - raw_min_y)
scale = min(scale_x, scale_y)

x_offset = padding + ((width - 2 * padding) - (raw_max_x - raw_min_x) * scale) / 2
y_offset = padding + ((height - 2 * padding) - (raw_max_y - raw_min_y) * scale) / 2

def to_svg_point(lon, lat):
    x, y = project_raw(lon, lat)
    px = round(x_offset + (x - raw_min_x) * scale, 1)
    py = round(y_offset + (raw_max_y - y) * scale, 1)
    return px, py

def coords_to_path_and_bbox(coords, geom_type):
    min_x, max_x = 1e9, -1e9
    min_y, max_y = 1e9, -1e9
    sum_x, sum_y, count = 0, 0, 0

    def ring_to_d(ring):
        nonlocal min_x, max_x, min_y, max_y, sum_x, sum_y, count
        if not ring:
            return ''
        pts = []
        last_px, last_py = None, None
        for pt in ring:
            px, py = to_svg_point(pt[0], pt[1])
            min_x = min(min_x, px)
            max_x = max(max_x, px)
            min_y = min(min_y, py)
            max_y = max(max_y, py)
            sum_x += px
            sum_y += py
            count += 1
            if last_px is None or (abs(px - last_px) + abs(py - last_py)) >= 0.7:
                pts.append(f'{px},{py}')
                last_px, last_py = px, py
        if len(pts) < 3:
            return ''
        return 'M' + 'L'.join(pts) + 'Z'

    path = ''
    if geom_type == 'Polygon':
        path = ''.join(ring_to_d(r) for r in coords)
    elif geom_type == 'MultiPolygon':
        path = ''.join(''.join(ring_to_d(r) for r in poly) for poly in coords)

    cx = round(sum_x / max(1, count), 1) if count else 0
    cy = round(sum_y / max(1, count), 1) if count else 0
    bbox = [round(min_x, 1), round(min_y, 1), round(max_x - min_x, 1), round(max_y - min_y, 1)]
    return path, bbox, [cx, cy]

state_name_map = {
    'Maharashtra': 'Maharastra',
    'Delhi': 'NCT of Delhi',
    'Jammu and Kashmir': 'Jammu & Kashmir',
    'Dadra and Nagar Haveli and Daman and Diu': 'Dadra and Nagar Haveli & Daman and Diu',
    'Andaman and Nicobar Islands': 'Andaman & Nicobar Islands'
}
dhpa_to_geo = {v: k for k, v in state_name_map.items()}

def clean_name(s):
    s = s.lower().strip()
    s = s.replace('&', 'and')
    s = re.sub(r'[^a-z0-9]', '', s)
    return s

aliases = {
    'pashchimchamparan': 'westchamparan',
    'purbachamparan': 'eastchamparan',
    'sripottisriramulunello': 'sripottisriramulunellore',
    'kachchh': 'kutch',
    'mahesana': 'mehsana',
    'dohad': 'dahod',
    'ahmadabad': 'ahmedabad',
    'gurgaon': 'gurugram',
    'mewat': 'nuh',
    'lahulandspiti': 'lahaulandspiti',
    'badgam': 'budgam',
    'baramula': 'baramulla',
    'shupiyan': 'shopian',
    'bandipore': 'bandipora',
    'firozpur': 'ferozepur',
    'sahibzadaajitsinghnagar': 'sasnagar',
    'muktsar': 'srimuktsarsahib',
    'bangalorerural': 'bengalururural',
    'bangaloreurban': 'bengaluruurban',
    'bangalore': 'bengaluruurban',
    'mysore': 'mysuru',
    'bellary': 'ballari',
    'bijapur': 'vijayapura',
    'belgaum': 'belagavi',
    'gulbarga': 'kalaburagi',
    'chikmagalur': 'chikkamagaluru',
    'shimoga': 'shivamogga',
    'tumkur': 'tumakuru',
    'khandwaeastnimar': 'eastnimar',
    'khargoonewestnimar': 'westnimar',
    'mumbaicity': 'mumbai',
    'gondiya': 'gondia',
    'buldana': 'buldhana',
    'baudh': 'boudh',
    'jajapur': 'jajpur',
    'anugul': 'angul',
    'debagarh': 'deogarh',
    'baleshwar': 'balasore',
    'kendujhar': 'keonjhar',
    'jagatsinghapur': 'jagatsinghpur',
    'narsinghpur': 'narsimhapur',
    'chittaurgarh': 'chittorgarh',
    'jalor': 'jalore',
    'jhunjhunun': 'jhunjhunu',
    'dhaulpur': 'dholpur',
    'tirunelveli': 'tirunelveli',
    'thegreenhouse': 'nilgiris',
    'thekanni': 'theni',
    'thoothukkudi': 'thoothukudi',
    'viluppuram': 'villupuram',
    'faizabad': 'ayodhya',
    'allahabad': 'prayagraj',
    'santravidasnagarbhadohi': 'bhadohi',
    'kashiramnagarkasganj': 'kasganj',
    'jyotibaphulenagar': 'amroha',
    'mahamayanagarhathras': 'hathras',
    'northtwentyfourparganas': 'north24parganas',
    'southtwentyfourparganas': 'south24parganas',
    'purulya': 'purulia',
    'medinipurwest': 'paschimmedinipur',
    'medinipureast': 'purbamedinipur',
    'kochbihar': 'coochbehar',
    'maldah': 'malda',
    'barddhaman': 'bardhaman',
    'hugli': 'hooghly',
    'haora': 'howrah',
    'southandaman': 'southandaman',
    'northandmiddleandaman': 'northandmiddleandaman',
    'nicobars': 'nicobar',
    'kodarma': 'koderma',
    'pashchimisinghbhum': 'westsinghbhum',
    'purbisinghbhum': 'eastsinghbhum',
    'ysr': 'ysrkadapa',
    'central': 'centraldelhi',
    'east': 'eastdelhi',
    'north': 'northdelhi',
    'northeast': 'northeastdelhi',
    'northwest': 'northwestdelhi',
    'south': 'southdelhi',
    'southwest': 'southwestdelhi',
    'west': 'westdelhi',
    'bid': 'beed',
    'sripottisriramulunello': 'spsnellore',
    'spsnellore': 'spsnellore',
    'chandel': 'saiha',
    'westdistrict': 'westsikkim',
    'eastdistrict': 'eastsikkim',
    'shahdara': 'eastdelhi',
    'southeast': 'southdelhi'
}

# Index geo district features
geo_by_state = {}
for feat in geo['features']:
    props = feat['properties']
    if 'district' in props:
        st = props['st_nm']
        dist = props['district']
        geo_by_state.setdefault(st, []).append((dist, feat))

# Index state polygons (from features without district)
state_poly_feats = {}
for feat in geo['features']:
    props = feat['properties']
    if 'district' not in props:
        st = props['st_nm']
        dhpa_st = state_name_map.get(st, st)
        state_poly_feats[dhpa_st] = feat

# Calculate district geometries
district_map_records = []
state_districts_map = {}

# Process each DHPA district
for d in dhpa_districts:
    st_raw = d['state']
    geo_st = dhpa_to_geo.get(st_raw, st_raw)
    d_name = d['name']
    d_clean = clean_name(d_name)
    d_aliased = aliases.get(d_clean, d_clean)
    
    geo_list = geo_by_state.get(geo_st, [])
    found_feat = None
    found_name = None

    for gd, feat in geo_list:
        gd_clean = clean_name(gd)
        gd_aliased = aliases.get(gd_clean, gd_clean)
        if gd_clean == d_clean or gd_aliased == d_aliased or gd_clean == d_aliased or gd_aliased == d_clean:
            found_feat = feat
            found_name = gd
            break
        elif gd_clean in d_aliased or d_aliased in gd_clean:
            found_feat = feat
            found_name = gd
            break

    if not found_feat and geo_list:
        # Fallback closest match
        gd_names = [x[0] for x in geo_list]
        close = get_close_matches(d_name, gd_names, n=1, cutoff=0.5)
        if close:
            for gd, feat in geo_list:
                if gd == close[0]:
                    found_feat = feat
                    found_name = gd
                    break

    path, bbox, center = '', [0, 0, 0, 0], [0, 0]
    if found_feat:
        path, bbox, center = coords_to_path_and_bbox(
            found_feat['geometry']['coordinates'], 
            found_feat['geometry']['type']
        )

    # Health status color and tier
    score = d['compound_vulnerability']['score']
    # 0 = Resilient (emerald), 1 = Isolated Deficit (sky), 2-3 = Moderate (amber), >=4 = Urgent (rose)
    if score >= 4:
        health_color = '#f43f5e' # rose-500
        health_status = 'Urgent Priority'
    elif score >= 2:
        health_color = '#f59e0b' # amber-500
        health_status = 'Needs Attention'
    elif score == 1:
        health_color = '#38bdf8' # sky-400
        health_status = 'Moderate Need'
    else:
        health_color = '#10b981' # emerald-500
        health_status = 'Good Performance'

    rec = {
        'id': d['id'],
        'name': d['name'],
        'state': d['state'],
        'path': path,
        'bbox': bbox,
        'center': center,
        'compound_score': score,
        'urgency_tier': d['compound_vulnerability']['urgency_tier'],
        'cluster_id': d['cluster_a']['id'],
        'primary_priority': d['recommendations']['primary_priority'],
        'health_status': health_status,
        'health_color': health_color
    }
    district_map_records.append(rec)
    state_districts_map.setdefault(st_raw, []).append(rec['id'])

# Process State Geometries
state_map_records = []
state_meta_lookup = {s['state']: s for s in metadata['states']}

all_dhpa_states = sorted(list(set(d['state'] for d in dhpa_districts)))

for st_name in all_dhpa_states:
    s_meta = state_meta_lookup.get(st_name, {})
    avg_score = s_meta.get('avg_compound_score', 0)
    mission_count = s_meta.get('mission_mode_count', 0)
    d_count = len(state_districts_map.get(st_name, []))

    # Health color for state based on avg compound score
    if avg_score >= 3.0:
        st_color = '#f43f5e'
        st_health = 'Urgent State Priority'
    elif avg_score >= 2.0:
        st_color = '#f59e0b'
        st_health = 'Needs Multi-Sector Boost'
    elif avg_score >= 1.2:
        st_color = '#38bdf8'
        st_health = 'Moderate State Performance'
    else:
        st_color = '#10b981'
        st_health = 'Strong Health Infrastructure'

    # State polygon
    feat = state_poly_feats.get(st_name)
    if feat:
        path, bbox, center = coords_to_path_and_bbox(
            feat['geometry']['coordinates'], 
            feat['geometry']['type']
        )
    else:
        # For single district UTs like Chandigarh and Lakshadweep, combine district paths
        st_dist_records = [r for r in district_map_records if r['state'] == st_name and r['path']]
        if st_dist_records:
            path = ''.join(r['path'] for r in st_dist_records)
            # compute combined bbox
            min_x = min(r['bbox'][0] for r in st_dist_records)
            min_y = min(r['bbox'][1] for r in st_dist_records)
            max_x = max(r['bbox'][0] + r['bbox'][2] for r in st_dist_records)
            max_y = max(r['bbox'][1] + r['bbox'][3] for r in st_dist_records)
            bbox = [round(min_x, 1), round(min_y, 1), round(max_x - min_x, 1), round(max_y - min_y, 1)]
            center = [round((min_x + max_x) / 2, 1), round((min_y + max_y) / 2, 1)]
        else:
            path, bbox, center = '', [0, 0, 0, 0], [0, 0]

    # Add extra padding to bbox for smooth zoom
    pad_factor = 0.15
    padded_bbox = [
        round(max(0, bbox[0] - bbox[2] * pad_factor), 1),
        round(max(0, bbox[1] - bbox[3] * pad_factor), 1),
        round(bbox[2] * (1 + 2 * pad_factor), 1),
        round(bbox[3] * (1 + 2 * pad_factor), 1)
    ]

    state_map_records.append({
        'name': st_name,
        'path': path,
        'bbox': padded_bbox,
        'center': center,
        'district_count': d_count,
        'avg_compound_score': avg_score,
        'mission_mode_count': mission_count,
        'health_status': st_health,
        'health_color': st_color,
        'district_ids': state_districts_map.get(st_name, [])
    })

output_data = {
    'viewBox': [0, 0, width, height],
    'states': state_map_records,
    'districts': district_map_records
}

output_path = 'frontend/src/data/india_map_paths.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, separators=(',', ':'))

file_size_kb = os.path.getsize(output_path) / 1024
print(f'Successfully generated {output_path}!')
print(f'Total States: {len(state_map_records)}')
print(f'Total Districts: {len(district_map_records)}')
print(f'File Size: {file_size_kb:.1f} KB')
