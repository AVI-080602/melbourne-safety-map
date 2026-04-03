# Melbourne Safety Map

A free, public-facing interactive crime safety map for Melbourne, Australia. Designed for tourists and residents to understand suburb-level crime risk at a glance.

**Live:** [melb-safety-map.vercel.app](https://melb-safety-map.vercel.app)

## Features

- Dark-themed heat map with 542 Melbourne suburbs
- Real 2025 crime data from Crime Statistics Agency Victoria
- Severity-weighted scoring (not just raw counts)
- 4-class risk system: Green / Yellow / Orange / Red
- Click any suburb for detailed crime breakdown
- Methodology panel explaining how scores are calculated

## Tech Stack

- **Frontend:** React (Vite) + Leaflet.js + leaflet.heat + Tailwind CSS
- **Data:** CSA Victoria XLSX (processed via Python pipeline)
- **Hosting:** Vercel (auto-deploys from GitHub)

## Crime Severity Scale (1–5)

Each offence type is weighted by how dangerous it is to personal safety:

### 5 — Violent / Life-threatening
- Homicide and related offences
- Serious assault (family violence & non-FV)
- Aggravated & non-aggravated robbery
- Neglect or ill treatment of people
- Terrorism offences

### 4 — Threatening / Dangerous
- Common assault (family violence & non-FV)
- Assault on police / emergency services
- Stalking & threatening behaviour
- Dangerous driving
- Arson & bushfire
- Firearms, weapons & explosives offences
- Residential aggravated burglary
- Breach of family violence / intervention order
- Riot and affray

### 3 — Personal Property Crime
- Harassment & private nuisance
- Burglary / break and enter
- Motor vehicle theft & steal from vehicle
- Drug dealing & trafficking
- Drug manufacturing
- Hacking & escape custody

### 2 — Property / Financial Crime
- Criminal damage & property damage
- Shoplifting, bicycle theft & other theft
- Forgery, deception & fraud
- Receiving stolen goods
- Cultivate drugs
- Bribery, privacy offences

### 1 — Minor / Regulatory
- Graffiti & fare evasion
- Drug use & possession
- Drunk and disorderly, offensive conduct
- Begging, defamation
- Regulatory & driving offences

## Risk Classes

| Score | Class | Color |
|-------|-------|-------|
| 0–30 | Low | Green |
| 31–55 | Moderate | Yellow |
| 56–80 | High | Orange |
| 80+ | Very High | Red |

## How Scores Are Calculated

1. Each offence type gets a severity weight (1–5)
2. Crime rate per 100k population is multiplied by severity
3. Weighted rates are summed per Local Government Area
4. Scores are normalised to 0–100 (capped at 95th percentile)
5. Each suburb inherits its LGA's score

## Data Pipeline

To regenerate data from a new CSA XLSX release:

```bash
pip install pandas openpyxl numpy
python pipeline/process_crime_data.py path/to/Data_Tables_LGA_Recorded_Offences.xlsx
```

## Local Development

```bash
npm install
npm run dev
```

## Data Source

[Crime Statistics Agency Victoria](https://www.crimestatistics.vic.gov.au) — Recorded Offences by LGA, Year Ending December 2025.
