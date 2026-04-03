"""
Geocode all Melbourne suburbs using Nominatim (free, no API key).
Rate limited to 1 req/sec. Takes ~10 minutes for 542 suburbs.
Outputs public/data/suburb-coords.json
"""

import json
import os
import sys
import time

try:
    import pandas as pd
    from geopy.geocoders import Nominatim
    from geopy.exc import GeocoderTimedOut, GeocoderServiceError
except ImportError:
    print("Install deps: pip install pandas openpyxl geopy")
    sys.exit(1)


def geocode_suburb(geolocator, suburb, postcode):
    """Try multiple query formats to find the suburb."""
    queries = [
        f"{suburb}, {postcode}, Victoria, Australia",
        f"{suburb}, Victoria, Australia",
        f"{suburb}, Melbourne, Australia",
    ]
    for q in queries:
        try:
            loc = geolocator.geocode(q, timeout=10)
            if loc and -39 < loc.latitude < -37 and 144 < loc.longitude < 146:
                return [round(loc.latitude, 6), round(loc.longitude, 6)]
        except (GeocoderTimedOut, GeocoderServiceError):
            time.sleep(2)
    return None


def main(xlsx_path):
    t3 = pd.read_excel(xlsx_path, sheet_name='Table 03')
    t3['Suburb/Town Name'] = t3['Suburb/Town Name'].str.strip()
    t3['Local Government Area'] = t3['Local Government Area'].str.strip()

    melb = {
        'Melbourne', 'Yarra', 'Port Phillip', 'Stonnington', 'Boroondara',
        'Monash', 'Glen Eira', 'Bayside', 'Kingston', 'Greater Dandenong',
        'Casey', 'Cardinia', 'Frankston', 'Mornington Peninsula',
        'Knox', 'Maroondah', 'Whitehorse', 'Manningham', 'Banyule',
        'Darebin', 'Merri-bek', 'Hume', 'Whittlesea',
        'Nillumbik', 'Moonee Valley', 'Maribyrnong', 'Hobsons Bay',
        'Wyndham', 'Brimbank', 'Melton', 'Yarra Ranges',
    }

    dm = t3[t3['Local Government Area'].isin(melb)]
    suburbs = dm[['Suburb/Town Name', 'Postcode']].drop_duplicates('Suburb/Town Name')

    out_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'public', 'data', 'suburb-coords.json'
    )

    # Load existing progress if any
    coords = {}
    if os.path.exists(out_path):
        with open(out_path) as f:
            coords = json.load(f)
        print(f"Loaded {len(coords)} existing coordinates")

    geolocator = Nominatim(user_agent='melb-safety-map-dev-v1')
    total = len(suburbs)
    missing = 0

    for i, (_, row) in enumerate(suburbs.iterrows()):
        name = row['Suburb/Town Name']
        postcode = int(row['Postcode'])

        if name in coords:
            continue

        result = geocode_suburb(geolocator, name, postcode)
        if result:
            coords[name] = result
            print(f"[{i+1}/{total}] {name}: {result}")
        else:
            missing += 1
            print(f"[{i+1}/{total}] {name}: NOT FOUND")

        # Save progress every 20 suburbs
        if (i + 1) % 20 == 0:
            with open(out_path, 'w') as f:
                json.dump(coords, f, indent=2)
            print(f"  Saved {len(coords)} coords so far...")

        time.sleep(1.1)  # Respect rate limit

    # Final save
    with open(out_path, 'w') as f:
        json.dump(coords, f, indent=2)

    print(f"\nDone! {len(coords)} suburbs geocoded, {missing} not found.")
    print(f"Saved to {out_path}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python geocode_suburbs.py <path_to_csa_xlsx>")
        sys.exit(1)
    main(sys.argv[1])
