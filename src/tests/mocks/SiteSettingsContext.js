// Mock SiteSettingsContext for testing
// This mock is used because the actual context is external to the package

export function useSiteSettings() {
  return {
    settings: {
      brandColors: ["#FF0000", "#00FF00", "#0000FF"],
    },
  };
}
