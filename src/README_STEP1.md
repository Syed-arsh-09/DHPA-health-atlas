# RHPA Step 1 code

This code makes the first data-foundation stage reproducible.

## Expected repository layout

```text
rhpa-health-atlas/
├── data/
│   ├── raw/
│   │   └── NFHS(factSheet).csv
│   └── processed/
├── outputs/
│   └── reports/
├── src/
│   └── step1_data_pipeline.py
└── requirements.txt
```

## Install dependencies

```bash
pip install pandas openpyxl
```

## Run from the repository root

```bash
python src/step1_data_pipeline.py
```

The script reads the raw CSV and generates:
- `data/processed/step1_district_health_cleaned.csv`
- `data/processed/step1_indicator_quality_flags.csv`
- `outputs/reports/step1_dataset_audit.xlsx`
- `outputs/reports/step1_data_dictionary_template.xlsx`

The raw file is never overwritten.

## Important interpretation note

The script preserves a flag for parenthesized values but does not assume what parentheses mean. Confirm that meaning using the official NFHS fact-sheet documentation before using those values in analysis.
