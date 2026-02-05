 // Feature flags for the application
 // These can be replaced with a proper feature flag service later
 
 export const featureFlags = {
   // Authentication features
   enableGoogleOAuth: false,
   
   // Payroll features
   enablePayrollWorkflow: true,
   
   // UI features
   enableDarkMode: true,
 } as const;
 
 export type FeatureFlags = typeof featureFlags;
 
 export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
   return featureFlags[flag];
 }