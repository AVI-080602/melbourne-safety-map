"""
Melbourne Safety Map — Data Pipeline
Processes CSA Victoria XLSX crime data into suburb-risk.json

Uses severity-weighted crime RATES (per 100k population) from Table 02,
then maps each suburb to its LGA score. Suburb-level top crimes come from Table 03.

Severity scale (1–5):
  5 = Violent / life-threatening (homicide, serious assault, robbery)
  4 = Threatening / dangerous (common assault, stalking, weapons, arson)
  3 = Personal property crime (burglary, car theft, drug dealing)
  2 = Property / financial (shoplifting, deception, property damage)
  1 = Minor / regulatory (disorderly conduct, fare evasion, drug possession)

Risk classes (0–100 score):
  0–25  = Green  (low risk)
  26–50 = Yellow (moderate risk)
  51–75 = Orange (high risk)
  76+   = Red    (very high risk)

Usage:
    python process_crime_data.py <path_to_csa_xlsx>
"""

import sys
import json
import os
import re

try:
    import pandas as pd
    import numpy as np
except ImportError:
    print("Install dependencies first: pip install pandas openpyxl numpy")
    sys.exit(1)


# ── Severity scores per offence subgroup ──────────────────────────────────────

SUBGROUP_SEVERITY = {
    # 5 — Violent / life-threatening
    'A10 Homicide and related offences': 5,
    'A211 FV Serious assault': 5,
    'A212 Non-FV Serious assault': 5,
    'A51 Aggravated robbery': 5,
    'A52 Non-aggravated robbery': 5,
    'A82 Neglect or ill treatment of people': 5,
    'D44 Terrorism offences': 5,

    # 4 — Threatening / dangerous
    'A22 Assault police, emergency services or other authorised officer': 4,
    'A231 FV Common assault': 4,
    'A232 Non-FV Common assault': 4,
    'A711 FV Stalking': 4,
    'A712 Non-FV Stalking': 4,
    'A731 FV Threatening behaviour': 4,
    'A732 Non-FV Threatening behaviour': 4,
    'A83 Throw or discharge object endangering people': 4,
    'A89 Other dangerous or negligent acts endangering people': 4,
    'A81 Dangerous driving': 4,
    'B11 Cause damage by fire': 4,
    'B12 Cause a bushfire': 4,
    'B311 Residential aggravated burglary': 4,
    'D11 Firearms offences': 4,
    'D12 Prohibited and controlled weapons offences': 4,
    'D13 Explosives offences': 4,
    'D21 Riot and affray': 4,
    'D42 Sabotage': 4,
    'E21 Breach family violence order': 4,
    'E22 Breach intervention order': 4,

    # 3 — Personal property crime
    'A721 FV Harassment and private nuisance': 3,
    'A722 Non-FV Harassment and private nuisance': 3,
    'B312 Non-residential aggravated burglary': 3,
    'B319 Unknown aggravated burglary': 3,
    'B321 Residential non-aggravated burglary': 3,
    'B322 Non-residential non-aggravated burglary': 3,
    'B329 Unknown non-aggravated burglary': 3,
    'B41 Motor vehicle theft': 3,
    'B42 Steal from a motor vehicle': 3,
    'C11 Drug dealing': 3,
    'C12 Drug trafficking': 3,
    'C22 Manufacture drugs': 3,
    'D43 Hacking': 3,
    'E11 Escape custody': 3,

    # 2 — Property / financial
    'B19 Other fire related offences': 2,
    'B21 Criminal damage': 2,
    'B29 Other property damage offences': 2,
    'B43 Steal from a retail store': 2,
    'B44 Theft of a bicycle': 2,
    'B45 Receiving or handling stolen goods': 2,
    'B49 Other theft': 2,
    'B51 Forgery and counterfeiting': 2,
    'B52 Possess equipment to make false instrument': 2,
    'B53 Obtain benefit by deception': 2,
    'B55 Deceptive business practices': 2,
    'B56 Professional malpractice and misrepresentation': 2,
    'B59 Other deception offences': 2,
    'B61 Bribery of officials': 2,
    'C21 Cultivate drugs': 2,
    'C23 Possess drug manufacturing equipment or precursor': 2,
    'D25 Criminal intent': 2,
    'D31 Privacy offences': 2,
    'D32 Hoaxes': 2,
    'D49 Other public security offences': 2,
    'E13 Resist or hinder officer': 2,
    'E14 Pervert the course of justice or commit perjury': 2,

    # 1 — Minor / regulatory
    'B22 Graffiti': 1,
    'B46 Fare evasion': 1,
    'B54 State false information': 1,
    'C31 Drug use': 1,
    'C32 Drug possession': 1,
    'C99 Other drug offences': 1,
    'D22 Drunk and disorderly in public': 1,
    'D23 Offensive conduct': 1,
    'D24 Offensive language': 1,
    'D26 Disorderly conduct': 1,
    'D33 Begging': 1,
    'D34 Defamation and libel': 1,
    'D35 Improper movement on public or private space': 1,
    'D36 Other public nuisance offences': 1,
    'D41 Immigration offences': 1,
    'E12 Fail to appear': 1,
    'E15 Prison regulation offences': 1,
    'E19 Other justice procedures offences': 1,
    'F10 Regulatory driving offences': 1,
    'F20 Transport regulation offences': 1,
    'F30 Other government regulatory offences': 1,
    'F90 Miscellaneous offences': 1,
}

DEFAULT_SEVERITY = 2

MELBOURNE_LGAS = {
    'Melbourne', 'Yarra', 'Port Phillip', 'Stonnington', 'Boroondara',
    'Monash', 'Glen Eira', 'Bayside', 'Kingston', 'Greater Dandenong',
    'Casey', 'Cardinia', 'Frankston', 'Mornington Peninsula',
    'Knox', 'Maroondah', 'Whitehorse', 'Manningham', 'Banyule',
    'Darebin', 'Moreland', 'Merri-bek', 'Hume', 'Whittlesea',
    'Nillumbik', 'Moonee Valley', 'Maribyrnong', 'Hobsons Bay',
    'Wyndham', 'Brimbank', 'Melton', 'Yarra Ranges',
}

TIPS = {
    'green': "Safe and family-friendly area. Standard precautions apply as with any urban environment.",
    'yellow': "Generally safe. Take standard precautions at night and stay aware of your surroundings.",
    'orange': "Exercise caution, especially at night. Stick to well-lit, busy streets.",
    'red': "Higher risk area. Stay alert, travel in groups at night, and keep valuables secure.",
}


def clean_offence_name(raw):
    """Strip leading codes like 'A20 ' from offence names."""
    return re.sub(r'^[A-Z]\d+\s+', '', str(raw))


def get_label(score):
    if score <= 30:
        return 'green'
    if score <= 55:
        return 'yellow'
    if score <= 80:
        return 'orange'
    return 'red'


def process(xlsx_path):
    print(f"Reading {xlsx_path}...")

    # ── Step 1: LGA-level severity-weighted crime rates from Table 02 ────
    t2 = pd.read_excel(xlsx_path, sheet_name='Table 02')
    t2['Local Government Area'] = t2['Local Government Area'].str.strip()

    dm2 = t2[t2['Local Government Area'].isin(MELBOURNE_LGAS)].copy()
    dm2['LGA Rate per 100,000 population'] = pd.to_numeric(
        dm2['LGA Rate per 100,000 population'], errors='coerce'
    ).fillna(0)
    dm2['severity'] = dm2['Offence Subgroup'].map(SUBGROUP_SEVERITY).fillna(DEFAULT_SEVERITY)
    dm2['weighted_rate'] = dm2['LGA Rate per 100,000 population'] * dm2['severity']

    lga_raw = dm2.groupby('Local Government Area')['weighted_rate'].sum()

    # Normalise: cap at 95th percentile to prevent CBD from squashing everything
    cap = lga_raw.quantile(0.95)
    lga_scores = (lga_raw.clip(upper=cap) / cap * 100).round(0).astype(int).clip(upper=100)

    print(f"\nLGA scores (severity-weighted rate per 100k, normalised 0-100):")
    for lga, s in lga_scores.sort_values(ascending=False).items():
        label = get_label(s)
        print(f"  {lga}: {s} ({label})")

    # ── Step 2: Map suburbs to LGAs using Table 03 ──────────────────────
    t3 = pd.read_excel(xlsx_path, sheet_name='Table 03')
    t3['Local Government Area'] = t3['Local Government Area'].str.strip()
    t3['Suburb/Town Name'] = t3['Suburb/Town Name'].str.strip()

    dm3 = t3[t3['Local Government Area'].isin(MELBOURNE_LGAS)].copy()
    dm3['Offence Count'] = pd.to_numeric(dm3['Offence Count'], errors='coerce').fillna(0)
    dm3['severity'] = dm3['Offence Subgroup'].map(SUBGROUP_SEVERITY).fillna(DEFAULT_SEVERITY)
    dm3['weighted'] = dm3['Offence Count'] * dm3['severity']

    # Suburb → LGA mapping
    suburb_lga = dm3[['Suburb/Town Name', 'Local Government Area']].drop_duplicates(
        'Suburb/Town Name'
    ).set_index('Suburb/Town Name')['Local Government Area']

    # ── Step 3: Build output per suburb ──────────────────────────────────
    result = {}
    for suburb, lga in suburb_lga.items():
        score = int(lga_scores.get(lga, 0))
        label = get_label(score)

        # Top crimes from suburb-level data (Table 03)
        suburb_data = dm3[dm3['Suburb/Town Name'] == suburb]
        crime_summary = suburb_data.groupby('Offence Subdivision').agg(
            weighted_total=('weighted', 'sum'),
            avg_severity=('severity', 'mean'),
        ).sort_values('weighted_total', ascending=False)

        top_crimes = []
        for subdiv_name, row in crime_summary.head(3).iterrows():
            clean = clean_offence_name(subdiv_name)
            sev = round(row['avg_severity'], 1)
            top_crimes.append(f"{clean} ({sev}/5)")

        result[suburb] = {
            'score': score,
            'label': label,
            'top_crimes': top_crimes,
            'tips': TIPS[label],
            'lga': lga,
        }

    # ── Write output ─────────────────────────────────────────────────────
    out_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'public', 'data', 'suburb-risk.json'
    )
    with open(out_path, 'w') as f:
        json.dump(result, f, indent=2)

    # Stats
    labels = [v['label'] for v in result.values()]
    print(f"\nWrote {len(result)} suburbs to {out_path}")
    print(f"\nDistribution:")
    print(f"  Green  (0-25):   {labels.count('green')}")
    print(f"  Yellow (26-50):  {labels.count('yellow')}")
    print(f"  Orange (51-75):  {labels.count('orange')}")
    print(f"  Red    (76-100): {labels.count('red')}")

    print("\nTop 10 highest risk suburbs:")
    for name, data in sorted(result.items(), key=lambda x: -x[1]['score'])[:10]:
        print(f"  {name} ({data['lga']}): {data['score']} ({data['label']}) — {', '.join(data['top_crimes'])}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    process(sys.argv[1])
