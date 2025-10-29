// Central brand constants for easy updates
export const BRAND_COMPANY = "eumanai";
export const BRAND_PRODUCT = "Zuri";
export const BRAND_FULL = `${BRAND_COMPANY} • ${BRAND_PRODUCT}`;
export const BRAND_DOMAIN = "eumanai.com";
export const BRAND_CONTACT_EMAIL = `hello@${BRAND_DOMAIN}`;

// Legacy object shape used by footer and possibly other components
export const brand = {
  name: BRAND_COMPANY,
  product: BRAND_PRODUCT,
  full: BRAND_FULL,
  domain: BRAND_DOMAIN,
  email: BRAND_CONTACT_EMAIL,
  locations: "Lagos",
};
