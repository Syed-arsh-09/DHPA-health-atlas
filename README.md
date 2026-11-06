# DHPA – District Healthcare Profiling & Analytics

---

## Overview

**DHPA (District Healthcare Profiling & Analytics)** is a machine learning project aimed at analyzing and clustering districts across India based on key healthcare indicators.

India faces significant regional disparities in healthcare access, infrastructure, and outcomes. This project leverages **NFHS-5 data** to identify patterns and group similar districts, enabling policymakers and researchers to design targeted interventions.

---

## Objectives

* Identify hidden patterns in rural healthcare data
* Cluster districts with similar healthcare conditions
* Support **data-driven policy making**
* Build a scalable analytics framework for nationwide use

---

## Data Source

* **NFHS-5 (National Family Health Survey)**
* District-level healthcare indicators
* Government-released datasets (India)

---

## Tech Stack

* **Programming:** Python
* **Data Processing:** Pandas, NumPy
* **Visualization:** Matplotlib, Seaborn
* **Machine Learning:** Scikit-learn
* **Deployment (Planned):** Streamlit

---

## Getting Started (How to Use This Project)

Follow these steps to run the project locally:

### 1️. Clone the Repository

```bash
git clone https://github.com/Syed-arsh-09/DHPA-health-atlas.git
cd rhpa-health-atlas
```

---

### 2️. Create Virtual Environment (Recommended)

```bash
python -m venv venv
```

Activate it:

* **Windows:**

```bash
venv\Scripts\activate
```

* **Mac/Linux:**

```bash
source venv/bin/activate
```

---

### 3️. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 4️. Add Dataset

* Place NFHS-5 dataset inside:

```
data/raw/
```

* Processed data will be saved in:

```
data/processed/
```

---

### 5️. Run Notebooks (Step-by-Step)

Navigate to notebooks:

```bash
cd notebooks
jupyter notebook
```

Run in order:

1. `01_data_extraction.ipynb`
2. `02_feature_engineering.ipynb`
3. `03_clustering.ipynb`
4. `04_visualization.ipynb`

---

### 6️. (Optional) Run Dashboard

```bash
cd app
streamlit run streamlit_app.py
```

---

## Methodology

1. **Data Collection**

   * Extract district-level data from NFHS-5 reports

2. **Data Preprocessing**

   * Cleaning missing/inconsistent values
   * Normalization of features

3. **Feature Engineering**

   * Selection of 15–20 critical healthcare indicators

4. **Clustering**

   * K-Means
   * Hierarchical Clustering

5. **Evaluation**

   * Silhouette Score
   * Davies-Bouldin Index

6. **Visualization**

   * Cluster plots
   * District-level insights

---

## Project Structure

```
rhpa-health-atlas/
│
├── data/
│   ├── raw/                  
│   ├── processed/            
│
├── notebooks/
├── src/
├── outputs/
├── app/
├── requirements.txt
└── README.md
```

---

## Expected Outcomes

* District clusters based on healthcare performance
* Identification of **high-risk and underserved regions**
* Insights for targeted healthcare planning
* Foundation for future predictive models

---

## Future Enhancements

* Interactive dashboard (Streamlit)
* State-wise and national clustering comparison
* Predictive modeling (health risk forecasting)
* Policy recommendation engine

---

## Use Cases

* Government & Policy Makers
* Healthcare Researchers
* NGOs & Social Organizations
* Data Scientists & Analysts

---

## Author

**Syed Arsh Ahmad**
B.Tech (Computer Science & Engineering)


---

## Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

---

## License

This project is licensed under the MIT License.

---

## Acknowledgements

* Government of India (NFHS Data)
* Open-source ML community

---
