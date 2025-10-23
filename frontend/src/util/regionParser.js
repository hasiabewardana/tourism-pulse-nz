// New Zealand regions for destination categorization
export const NZ_REGIONS = [
  "Northland",
  "Auckland",
  "Waikato",
  "Bay of Plenty",
  "Gisborne",
  "Hawke's Bay",
  "Taranaki",
  "Manawatū-Whanganui",
  "Wellington",
  "Tasman",
  "Nelson",
  "Marlborough",
  "West Coast",
  "Canterbury",
  "Otago",
  "Southland",
];

/**
 * Extract region from location name or description
 * @param locationName - The location or destination name
 * @returns The matched region or 'Unknown'
 */
export const extractRegion = (locationName) => {
  if (!locationName) return "Unknown";

  const normalizedLocation = locationName.toLowerCase();

  // Check for exact or partial matches
  for (const region of NZ_REGIONS) {
    if (normalizedLocation.includes(region.toLowerCase())) {
      return region;
    }
  }

  // Additional mappings for common city-to-region associations
  const cityToRegion = {
    queenstown: "Otago",
    dunedin: "Otago",
    wanaka: "Otago",
    christchurch: "Canterbury",
    akaroa: "Canterbury",
    kaikoura: "Canterbury",
    rotorua: "Bay of Plenty",
    taupo: "Bay of Plenty",
    tauranga: "Bay of Plenty",
    napier: "Hawke's Bay",
    hastings: "Hawke's Bay",
    "new plymouth": "Taranaki",
    "palmerston north": "Manawatū-Whanganui",
    whanganui: "Manawatū-Whanganui",
    hamilton: "Waikato",
    cambridge: "Waikato",
    thames: "Waikato",
    "bay of islands": "Northland",
    whangarei: "Northland",
    paihia: "Northland",
    picton: "Marlborough",
    blenheim: "Marlborough",
    greymouth: "West Coast",
    "franz josef": "West Coast",
    hokitika: "West Coast",
    invercargill: "Southland",
    "milford sound": "Southland",
    "stewart island": "Southland",
  };

  for (const [city, region] of Object.entries(cityToRegion)) {
    if (normalizedLocation.includes(city)) {
      return region;
    }
  }

  return "Unknown";
};

/**
 * Get all available regions
 * @returns Array of NZ region names
 */
export const getAllRegions = () => {
  return [...NZ_REGIONS];
};
