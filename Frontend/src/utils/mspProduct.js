const normalizeMspKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const MSP_ALIASES = {
  corn: "maize",
  "corn maize": "maize",
  "maize corn": "maize",
  "mustard seed": "rapeseed & mustard",
  soybean: "soyabean (yellow)",
  sesame: "sesamum",
  "sesame til": "sesamum",
  til: "sesamum",
  "toor dal": "tur / arhar",
  "arhar dal": "tur / arhar",
  "pigeon pea": "tur / arhar",
  "moong dal": "moong",
  "urad dal": "urad",
  "masoor dal": "lentil (masur)",
  chickpeas: "gram (chana)",
  chana: "gram (chana)",
  cotton: "cotton medium staple",
};

export const resolveMspProductFromCatalog = (value, catalog = []) => {
  const key = normalizeMspKey(value);
  if (!key) return null;

  const aliasTarget = MSP_ALIASES[key] || null;
  const list = Array.isArray(catalog) ? catalog : [];

  const byExact = list.find((item) => normalizeMspKey(item?.product) === key);
  if (byExact) return byExact;

  if (aliasTarget) {
    return list.find((item) => normalizeMspKey(item?.product) === normalizeMspKey(aliasTarget)) || null;
  }

  return null;
};

