// Clean, natural human-friendly indicator mappings with complete survey definitions
export const INDICATOR_MAP = {
  C13: {
    code: 'C13',
    shortName: 'Clean Drinking Water',
    fullName: 'Population living in households with an improved drinking-water source (%)',
    category: 'Household Amenities & Financing',
    scheme: 'Jal Jeevan Mission (JJM)'
  },
  C14: {
    code: 'C14',
    shortName: 'Improved Sanitation',
    fullName: 'Population living in households that use an improved sanitation facility (%)',
    category: 'Household Amenities & Financing',
    scheme: 'Swachh Bharat Mission (SBM)'
  },
  C15: {
    code: 'C15',
    shortName: 'Clean Cooking Fuel',
    fullName: 'Households using clean fuel (LPG/electricity/biogas) for cooking (%)',
    category: 'Household Amenities & Financing',
    scheme: 'Pradhan Mantri Ujjwala Yojana (PMUY)'
  },
  C17: {
    code: 'C17',
    shortName: 'Health Insurance Coverage',
    fullName: 'Households with any usual member covered under a health insurance/financing scheme (%)',
    category: 'Household Amenities & Financing',
    scheme: 'Ayushman Bharat PM-JAY'
  },
  C19: {
    code: 'C19',
    shortName: 'Female Literacy Rate',
    fullName: 'Women (age 15-49 years) who are literate (%)',
    category: 'Socio-Demographic & Education',
    scheme: 'Beti Bachao Beti Padhao'
  },
  C21: {
    code: 'C21',
    shortName: 'Underage Marriage',
    fullName: 'Women age 20-24 years married before the legal age of 18 years (%)',
    category: 'Reproductive Health & Family Planning',
    scheme: 'Prohibition of Child Marriage Act & Beti Bachao'
  },
  C23: {
    code: 'C23',
    shortName: 'Teenage Pregnancy Rate',
    fullName: 'Women age 15-19 years who were already mothers or pregnant at survey (%)',
    category: 'Reproductive Health & Family Planning',
    scheme: 'Rashtriya Kishor Swasthya Karyakram (RKSK)'
  },
  C24: {
    code: 'C24',
    shortName: 'Menstrual Hygiene Usage',
    fullName: 'Women age 15-24 years who use hygienic methods during their menstrual period (%)',
    category: 'Reproductive Health & Family Planning',
    scheme: 'Menstrual Hygiene Scheme (MHS)'
  },
  C26: {
    code: 'C26',
    shortName: 'Modern Family Planning',
    fullName: 'Current use of any modern contraceptive method among married women age 15-49 (%)',
    category: 'Reproductive Health & Family Planning',
    scheme: 'Mission Parivar Vikas (MPV)'
  },
  C33: {
    code: 'C33',
    shortName: 'Unmet Family Planning Need',
    fullName: 'Total unmet need for family planning among married women age 15-49 (%)',
    category: 'Reproductive Health & Family Planning',
    scheme: 'National Family Planning Programme'
  },
  C35: {
    code: 'C35',
    shortName: 'Family Planning Counseling',
    fullName: 'Health workers who talked to non-users about family planning options (%)',
    category: 'Reproductive Health & Family Planning',
    scheme: 'Community Health Worker Counseling (ASHA/ANM)'
  },
  C37: {
    code: 'C37',
    shortName: '1st Trimester Prenatal Check-up',
    fullName: 'Mothers who received an antenatal check-up in the first trimester of pregnancy (%)',
    category: 'Maternal & Newborn Care',
    scheme: 'Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)'
  },
  C38: {
    code: 'C38',
    shortName: '4+ Antenatal Visits',
    fullName: 'Mothers who completed at least 4 antenatal care visits during pregnancy (%)',
    category: 'Maternal & Newborn Care',
    scheme: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)'
  },
  C39: {
    code: 'C39',
    shortName: 'Neonatal Tetanus Protection',
    fullName: 'Mothers whose last birth was protected against neonatal tetanus (%)',
    category: 'Maternal & Newborn Care',
    scheme: 'National Immunisation Schedule (TT/Td)'
  },
  C41: {
    code: 'C41',
    shortName: '180+ Days Iron Supplementation',
    fullName: 'Mothers who consumed Iron Folic Acid (IFA) for 180 days or more while pregnant (%)',
    category: 'Maternal & Newborn Care',
    scheme: 'Anaemia Mukt Bharat (AMB)'
  },
  C42: {
    code: 'C42',
    shortName: 'Mother-Child Protection Card',
    fullName: 'Registered pregnancies for which mother received an MCP card (%)',
    category: 'Maternal & Newborn Care',
    scheme: 'RCH / Anmol Digital Tracking'
  },
  C43: {
    code: 'C43',
    shortName: 'Postnatal Care within 2 Days',
    fullName: 'Mothers who received postnatal care from a health worker within 2 days of delivery (%)',
    category: 'Maternal & Newborn Care',
    scheme: 'Home Based Post Natal Care (HBPNC)'
  },
  C44: {
    code: 'C44',
    shortName: 'Public Hospital Delivery Cost',
    fullName: 'Average out-of-pocket expenditure per delivery in a public health facility (Rs.)',
    category: 'Maternal & Newborn Care',
    scheme: 'Janani Shishu Suraksha Karyakram (JSSK)'
  },
  C47: {
    code: 'C47',
    shortName: 'Hospital Deliveries',
    fullName: 'Institutional births in a healthcare facility (public or private) (%)',
    category: 'Maternal & Newborn Care',
    scheme: 'Janani Suraksha Yojana (JSY)'
  },
  C48: {
    code: 'C48',
    shortName: 'Public Facility Births',
    fullName: 'Institutional births taking place in public government healthcare facilities (%)',
    category: 'Maternal & Newborn Care',
    scheme: 'LaQshya Labour Room Quality Initiative'
  },
  C54: {
    code: 'C54',
    shortName: 'Full Child Immunisation',
    fullName: 'Children age 12-23 months fully vaccinated against all primary childhood diseases (%)',
    category: 'Child Immunisation & Preventative Care',
    scheme: 'Intensified Mission Indradhanush (IMI 5.0)'
  },
  C60: {
    code: 'C60',
    shortName: 'Measles 2nd Dose Vaccine',
    fullName: 'Children age 24-35 months who have received a second dose of measles vaccine (%)',
    category: 'Child Immunisation & Preventative Care',
    scheme: 'Universal Immunization Programme (UIP)'
  },
  C61: {
    code: 'C61',
    shortName: 'Rotavirus Vaccine',
    fullName: 'Children age 12-23 months who have received 3 doses of rotavirus vaccine (%)',
    category: 'Child Immunisation & Preventative Care',
    scheme: 'Universal Immunization Programme (UIP)'
  },
  C63: {
    code: 'C63',
    shortName: 'Child Vitamin A Dose',
    fullName: 'Children age 9-35 months who received a Vitamin A dose in the last 6 months (%)',
    category: 'Child Immunisation & Preventative Care',
    scheme: 'National Prophylaxis Programme against Blindness'
  },
  C66: {
    code: 'C66',
    shortName: 'Childhood Diarrhoea Rate',
    fullName: 'Prevalence of diarrhoea in the 2 weeks preceding the survey (under age 5) (%)',
    category: 'Child Health & Disease Prevalence',
    scheme: 'Intensified Diarrhoea Control Fortnight (IDCF)'
  },
  C70: {
    code: 'C70',
    shortName: 'Respiratory Infection Rate',
    fullName: 'Prevalence of acute respiratory infection (ARI) in the 2 weeks preceding survey (%)',
    category: 'Child Health & Disease Prevalence',
    scheme: 'SAANS Campaign for Childhood Pneumonia'
  },
  C72: {
    code: 'C72',
    shortName: 'Immediate Breastfeeding',
    fullName: 'Children under age 3 years breastfed within one hour of birth (%)',
    category: 'Nutritional Status & Anaemia',
    scheme: 'MAA (Mothers Absolute Affection) Programme'
  },
  C77: {
    code: 'C77',
    shortName: 'Adequate Diet for Children',
    fullName: 'Children age 6-23 months receiving an adequate diversified diet (%)',
    category: 'Nutritional Status & Anaemia',
    scheme: 'POSHAN 2.0 & Anganwadi Services'
  },
  C78: {
    code: 'C78',
    shortName: 'Childhood Stunting Rate',
    fullName: 'Children under 5 years who are stunted (low height-for-age) (%)',
    category: 'Nutritional Status & Anaemia',
    scheme: 'POSHAN Abhiyaan (National Nutrition Mission)'
  },
  C79: {
    code: 'C79',
    shortName: 'Childhood Wasting Rate',
    fullName: 'Children under 5 years who are wasted (low weight-for-height) (%)',
    category: 'Nutritional Status & Anaemia',
    scheme: 'Nutrition Rehabilitation Centres (NRC)'
  },
  C82: {
    code: 'C82',
    shortName: 'Childhood Overweight Rate',
    fullName: 'Children under 5 years who are overweight (high weight-for-height) (%)',
    category: 'Nutritional Status & Anaemia',
    scheme: 'Dietary Diversity & Nutrition Guidelines'
  },
  C83: {
    code: 'C83',
    shortName: 'Female Underweight Rate',
    fullName: 'Women age 15-49 years whose Body Mass Index is below normal (BMI < 18.5) (%)',
    category: 'Nutritional Status & Anaemia',
    scheme: 'Integrated Child Development Services (ICDS)'
  },
  C84: {
    code: 'C84',
    shortName: 'Female Obesity Rate',
    fullName: 'Women age 15-49 years who are overweight or obese (BMI ≥ 25.0) (%)',
    category: 'Nutritional Status & Anaemia',
    scheme: 'Fit India & Wellness Centres'
  },
  C85: {
    code: 'C85',
    shortName: 'High Waist-to-Hip Ratio',
    fullName: 'Women age 15-49 years with elevated waist-to-hip metabolic risk ratio (≥ 0.85) (%)',
    category: 'Nutritional Status & Anaemia',
    scheme: 'Ayushman Arogya Mandir Wellness Screening'
  },
  C86: {
    code: 'C86',
    shortName: 'Childhood Anaemia Rate',
    fullName: 'Children age 6-59 months who are anaemic with hemoglobin < 11.0 g/dl (%)',
    category: 'Nutritional Status & Anaemia',
    scheme: 'Anaemia Mukt Bharat (AMB - Biweekly IFA Syrup)'
  },
  C89: {
    code: 'C89',
    shortName: 'Maternal Anaemia Rate',
    fullName: 'All women age 15-49 years who are anaemic with hemoglobin < 12.0 g/dl (%)',
    category: 'Nutritional Status & Anaemia',
    scheme: 'Anaemia Mukt Bharat (AMB - Weekly IFA Tablets)'
  },
  C93: {
    code: 'C93',
    shortName: 'Women High Blood Sugar',
    fullName: 'Women age 15+ with high blood sugar (>140 mg/dl) or taking anti-diabetic medicine (%)',
    category: 'NCD Risk & Preventive Screening',
    scheme: 'National Programme for Prevention of NCDs (NP-NCD)'
  },
  C96: {
    code: 'C96',
    shortName: 'Men High Blood Sugar',
    fullName: 'Men age 15+ with high blood sugar (>140 mg/dl) or taking anti-diabetic medicine (%)',
    category: 'NCD Risk & Preventive Screening',
    scheme: 'National Programme for Prevention of NCDs (NP-NCD)'
  },
  C99: {
    code: 'C99',
    shortName: 'Women High Blood Pressure',
    fullName: 'Women age 15+ with elevated blood pressure (≥140/90) or taking BP medication (%)',
    category: 'NCD Risk & Preventive Screening',
    scheme: 'India Hypertension Control Initiative (IHCI)'
  },
  C102: {
    code: 'C102',
    shortName: 'Men High Blood Pressure',
    fullName: 'Men age 15+ with elevated blood pressure (≥140/90) or taking BP medication (%)',
    category: 'NCD Risk & Preventive Screening',
    scheme: 'India Hypertension Control Initiative (IHCI)'
  },
  C103: {
    code: 'C103',
    shortName: 'Cervical Cancer Screening',
    fullName: 'Women age 30-49 years who ever underwent a screening test for cervical cancer (%)',
    category: 'NCD Risk & Preventive Screening',
    scheme: 'Universal NCD Screening at Ayushman Arogya Mandir'
  },
  C104: {
    code: 'C104',
    shortName: 'Breast Cancer Examination',
    fullName: 'Women age 30-49 years who ever underwent clinical breast examination for breast cancer (%)',
    category: 'NCD Risk & Preventive Screening',
    scheme: 'Universal NCD Screening at Ayushman Arogya Mandir'
  },
  C105: {
    code: 'C105',
    shortName: 'Oral Cancer Examination',
    fullName: 'Women age 30-49 years who ever underwent oral cavity examination for oral cancer (%)',
    category: 'NCD Risk & Preventive Screening',
    scheme: 'Universal NCD Screening at Ayushman Arogya Mandir'
  },
  C106: {
    code: 'C106',
    shortName: 'Women Tobacco Consumption',
    fullName: 'Women age 15 years and above who consume any form of tobacco (%)',
    category: 'Health Risk Behaviours',
    scheme: 'National Tobacco Control Programme (NTCP)'
  },
  C107: {
    code: 'C107',
    shortName: 'Men Tobacco Consumption',
    fullName: 'Men age 15 years and above who consume any form of tobacco (%)',
    category: 'Health Risk Behaviours',
    scheme: 'National Tobacco Control Programme (NTCP)'
  },
  C108: {
    code: 'C108',
    shortName: 'Women Alcohol Consumption',
    fullName: 'Women age 15 years and above who consume alcohol (%)',
    category: 'Health Risk Behaviours',
    scheme: 'Community Mental Health & De-addiction Initiatives'
  },
  C109: {
    code: 'C109',
    shortName: 'Men Alcohol Consumption',
    fullName: 'Men age 15 years and above who consume alcohol (%)',
    category: 'Health Risk Behaviours',
    scheme: 'Community Mental Health & De-addiction Initiatives'
  }
};

export function getIndicatorInfo(code, fallbackName = '') {
  if (INDICATOR_MAP[code]) {
    return INDICATOR_MAP[code];
  }
  return {
    code,
    shortName: fallbackName || code,
    fullName: fallbackName || code,
    category: 'General Healthcare',
    scheme: 'National Health Mission (NHM)'
  };
}

// Maps action descriptions or priorities to official government programs
export function resolveGovernmentScheme(actionText = '', priority = '') {
  const t = (actionText || '').toLowerCase();
  
  if (t) {
    if (t.includes('hypertension') || t.includes('blood pressure') || t.includes('ihci')) {
      return {
        name: 'India Hypertension Control Initiative (IHCI)',
        badgeColor: 'text-amber-300 bg-amber-950/80 border-amber-700/80',
        actionType: 'Hypertension Protocol & Drug Saturation'
      };
    }
    if (t.includes('via (visual inspection') || t.includes('cervical') || t.includes('breast examination') || t.includes('cancer')) {
      return {
        name: 'National Cancer Screening Programme',
        badgeColor: 'text-fuchsia-300 bg-fuchsia-950/80 border-fuchsia-700/80',
        actionType: 'Early Cancer Detection (Cervical & Breast)'
      };
    }
    if (t.includes('metformin') || t.includes('ncd screening camps') || t.includes('workplace ncd') || t.includes('metabolic health') || t.includes('glucose') || t.includes('diabetes')) {
      return {
        name: 'NP-NCD & Ayushman Arogya Mandir',
        badgeColor: 'text-sky-300 bg-sky-950/80 border-sky-700/80',
        actionType: 'Metabolic & Chronic Disease Screening'
      };
    }
    if (t.includes('ayushman arogya mandir') || t.includes('adult wellness')) {
      return {
        name: 'Ayushman Arogya Mandir (HWCs)',
        badgeColor: 'text-teal-300 bg-teal-950/80 border-teal-700/80',
        actionType: 'Comprehensive Primary Healthcare'
      };
    }
    if (t.includes('pm-jay') || t.includes('golden card') || t.includes('insurance')) {
      return {
        name: 'Ayushman Bharat PM-JAY',
        badgeColor: 'text-yellow-300 bg-yellow-950/80 border-yellow-700/80',
        actionType: 'PM-JAY Secondary & Tertiary Hospital Cover'
      };
    }
    if (t.includes('indradhanush') || t.includes('u-win') || (t.includes('booster') && t.includes('dropouts'))) {
      return {
        name: 'Intensified Mission Indradhanush (IMI 5.0)',
        badgeColor: 'text-emerald-300 bg-emerald-950/80 border-emerald-700/80',
        actionType: 'Routine & Catch-up Vaccination Drive'
      };
    }
    if (t.includes('rotavirus') || t.includes('cold-chain') || t.includes('universal immunisation')) {
      return {
        name: 'Universal Immunisation Programme (UIP)',
        badgeColor: 'text-teal-300 bg-teal-950/80 border-teal-700/80',
        actionType: 'Cold-Chain & Routine Vaccine Supply'
      };
    }
    if (t.includes('iron-folic') || t.includes('ifa') || t.includes('anaemia mukt') || t.includes('haemoglobinometer') || t.includes('deworming')) {
      return {
        name: 'Anaemia Mukt Bharat (AMB)',
        badgeColor: 'text-rose-300 bg-rose-950/80 border-rose-700/80',
        actionType: 'Iron-Folic Acid & School De-worming'
      };
    }
    if (t.includes('vitamin a')) {
      return {
        name: 'National Vitamin A Prophylaxis Programme',
        badgeColor: 'text-orange-300 bg-orange-950/80 border-orange-700/80',
        actionType: 'Biannual Vitamin A Saturation Rounds'
      };
    }
    if (t.includes('first-1000-days') || t.includes('supplementary nutrition') || t.includes('rehabilitation centres') || t.includes('malnutrition') || t.includes('food-ration') || t.includes('stunt') || t.includes('wast')) {
      return {
        name: 'POSHAN Abhiyaan (National Nutrition Mission)',
        badgeColor: 'text-amber-300 bg-amber-950/80 border-amber-700/80',
        actionType: 'Anganwadi Nutrition & Growth Monitoring'
      };
    }
    if (t.includes('pmsma') || t.includes('antenatal clinics') || t.includes('antenatal')) {
      return {
        name: 'Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)',
        badgeColor: 'text-pink-300 bg-pink-950/80 border-pink-700/80',
        actionType: 'Specialist Fixed-Day Prenatal Checkups'
      };
    }
    if (t.includes('jssk') || t.includes('entitlements') || t.includes('out-of-pocket')) {
      return {
        name: 'Janani Shishu Suraksha Karyakram (JSSK)',
        badgeColor: 'text-purple-300 bg-purple-950/80 border-purple-700/80',
        actionType: 'Zero-Expense Hospital Deliveries & Newborn Care'
      };
    }
    if (t.includes('jsy') || t.includes('phc/chc delivery') || t.includes('birth transport') || t.includes('institutional delivery') || t.includes('deliver')) {
      return {
        name: 'Janani Suraksha Yojana (JSY)',
        badgeColor: 'text-emerald-300 bg-emerald-950/80 border-emerald-700/80',
        actionType: 'Safe Institutional Delivery Support'
      };
    }
    if (t.includes('mcp card') || t.includes('early pregnancy detection') || t.includes('maternal benefit')) {
      return {
        name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
        badgeColor: 'text-violet-300 bg-violet-950/80 border-violet-700/80',
        actionType: 'First-Trimester Registration & Maternal Benefit'
      };
    }
    if (t.includes('antara') || t.includes('chhaya') || t.includes('spacing methods') || t.includes('contracepti') || t.includes('family planning')) {
      return {
        name: 'Mission Parivar Vikas (MPV)',
        badgeColor: 'text-indigo-300 bg-indigo-950/80 border-indigo-700/80',
        actionType: 'Modern Contraceptives & Spacing Counseling'
      };
    }
    if (t.includes('beti bachao') || t.includes('adolescent tracking') || t.includes('early marriage')) {
      return {
        name: 'Beti Bachao Beti Padhao',
        badgeColor: 'text-pink-300 bg-pink-950/80 border-pink-700/80',
        actionType: 'Adolescent Welfare & Delaying Early Marriage'
      };
    }
    if (t.includes('sanitary napkin') || t.includes('menstrual hygiene')) {
      return {
        name: 'Menstrual Hygiene Scheme (MHS)',
        badgeColor: 'text-rose-300 bg-rose-950/80 border-rose-700/80',
        actionType: 'Subsidized Sanitary Napkin Distribution'
      };
    }
    if (t.includes('ujjwala') || t.includes('lpg') || t.includes('cooking fuel')) {
      return {
        name: 'Pradhan Mantri Ujjwala Yojana (PMUY)',
        badgeColor: 'text-orange-300 bg-orange-950/80 border-orange-700/80',
        actionType: 'Clean Cooking LPG Connection Saturation'
      };
    }
    if (t.includes('toilets') || t.includes('odf') || t.includes('sanitation') || t.includes('swachh')) {
      return {
        name: 'Swachh Bharat Mission (Grameen / Urban)',
        badgeColor: 'text-cyan-300 bg-cyan-950/80 border-cyan-700/80',
        actionType: 'Household Sanitation & ODF Sustainability'
      };
    }
    if (t.includes('drinking water') || t.includes('jal jeevan') || t.includes('piped water')) {
      return {
        name: 'Jal Jeevan Mission (Har Ghar Jal)',
        badgeColor: 'text-sky-300 bg-sky-950/80 border-sky-700/80',
        actionType: 'Piped Clean Drinking Water Tap Supply'
      };
    }
  }

  // Fallback to priority domain if action text could not resolve
  const p = (priority || '').toLowerCase();
  if (p.includes('hypertension') || p.includes('blood pressure')) {
    return {
      name: 'India Hypertension Control Initiative (IHCI)',
      badgeColor: 'text-amber-300 bg-amber-950/80 border-amber-700/80',
      actionType: 'Hypertension Protocol & Drug Saturation'
    };
  }
  if (p.includes('ncd') || p.includes('chronic')) {
    return {
      name: 'NP-NCD & Ayushman Arogya Mandir',
      badgeColor: 'text-sky-300 bg-sky-950/80 border-sky-700/80',
      actionType: 'Metabolic & Chronic Disease Screening'
    };
  }
  if (p.includes('immunis') || p.includes('vaccin')) {
    return {
      name: 'Intensified Mission Indradhanush (IMI 5.0)',
      badgeColor: 'text-emerald-300 bg-emerald-950/80 border-emerald-700/80',
      actionType: 'Routine & Catch-up Vaccination Drive'
    };
  }
  if (p.includes('anaemia') || p.includes('iron')) {
    return {
      name: 'Anaemia Mukt Bharat (AMB)',
      badgeColor: 'text-rose-300 bg-rose-950/80 border-rose-700/80',
      actionType: 'Iron-Folic Acid & School De-worming'
    };
  }
  if (p.includes('nutrition') || p.includes('stunt')) {
    return {
      name: 'POSHAN Abhiyaan (National Nutrition Mission)',
      badgeColor: 'text-amber-300 bg-amber-950/80 border-amber-700/80',
      actionType: 'Anganwadi Nutrition & Growth Monitoring'
    };
  }
  if (p.includes('maternal') || p.includes('pregnancy')) {
    return {
      name: 'Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)',
      badgeColor: 'text-pink-300 bg-pink-950/80 border-pink-700/80',
      actionType: 'Specialist Fixed-Day Prenatal Checkups'
    };
  }
  if (p.includes('family planning') || p.includes('reproductive')) {
    return {
      name: 'Mission Parivar Vikas (MPV)',
      badgeColor: 'text-indigo-300 bg-indigo-950/80 border-indigo-700/80',
      actionType: 'Modern Contraceptives & Spacing Counseling'
    };
  }
  if (p.includes('amenities') || p.includes('sanitation')) {
    return {
      name: 'Swachh Bharat Mission (Grameen / Urban)',
      badgeColor: 'text-cyan-300 bg-cyan-950/80 border-cyan-700/80',
      actionType: 'Household Sanitation & ODF Sustainability'
    };
  }
  if (p.includes('water')) {
    return {
      name: 'Jal Jeevan Mission (Har Ghar Jal)',
      badgeColor: 'text-sky-300 bg-sky-950/80 border-sky-700/80',
      actionType: 'Piped Clean Drinking Water Tap Supply'
    };
  }
  if (p.includes('insurance')) {
    return {
      name: 'Ayushman Bharat PM-JAY',
      badgeColor: 'text-yellow-300 bg-yellow-950/80 border-yellow-700/80',
      actionType: 'PM-JAY Health Protection Card Saturation'
    };
  }

  return {
    name: 'National Health Mission (NHM)',
    badgeColor: 'text-blue-300 bg-blue-950/80 border-blue-700/80',
    actionType: 'Primary Healthcare Facility Support'
  };
}
