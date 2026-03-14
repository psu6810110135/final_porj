import { toAbsoluteAssetUrl } from "@/config/api";
import { getProvinceLabel } from "./tourLabels";

export const translateDuration = (duration?: string) => {
  if (!duration) return "";
  return duration.replace(/Days?/gi, "วัน").replace(/Nights?/gi, "คืน");
};

export const translateLocation = (location?: string) => {
  if (!location) return "";
  if (location === "Thailand") return "ประเทศไทย";

  // Check if it's a region
  const regionMap: Record<string, string> = {
    North: "ภาคเหนือ",
    Central: "ภาคกลาง",
    Northeast: "ภาคอีสาน",
    West: "ภาคตะวันตก",
    East: "ภาคตะวันออก",
    South: "ภาคใต้",
  };

  if (regionMap[location]) return regionMap[location];

  // Otherwise use province translation
  return getProvinceLabel(location);
};

export const getImageUrl = (path?: string) => {
  if (!path) return "https://via.placeholder.com/400x300?text=No+Img";
  return toAbsoluteAssetUrl(path);
};
