const normalizeBaseUrl = (value: string) => value.replace(/\/+$/g, "");

const resolveApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredBaseUrl) {
    return normalizeBaseUrl(configuredBaseUrl);
  }

  if (import.meta.env.DEV) {
    return "http://localhost:3000";
  }

  return normalizeBaseUrl(window.location.origin);
};

export const API_BASE_URL = resolveApiBaseUrl();

export const toAbsoluteAssetUrl = (path?: string | null) => {
  if (!path) return "";
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
