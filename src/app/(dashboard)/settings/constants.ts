export interface SystemSettingItem {
  key: string;
  value: Record<string, any>;
  description?: string;
  updated_at?: string;
}

export const DEFAULT_SETTINGS: Record<string, Record<string, any>> = {
  general: {
    platformName: "Trash2Treasure Admin",
    supportEmail: "support@t2t.com",
    timezone: "Asia/Kolkata (UTC+05:30)",
    currency: "INR (₹)",
    maintenanceMode: false,
  },
  appearance: {
    theme: "dark",
    accentColor: "#14EF10",
    density: "comfortable",
    glassmorphism: "medium",
    sidebarExpanded: true,
  },
  notifications: {
    emailAlerts: true,
    dailyDigest: true,
    pushSound: true,
    auditNotifications: true,
    highPriorityOnly: false,
  },
  reward_rules: {
    plasticPointsPerKg: 50,
    ewastePointsPerKg: 150,
    metalPointsPerKg: 100,
    paperPointsPerKg: 30,
    glassPointsPerKg: 40,
    dailyBonusCap: 500,
    tierMultiplierBronze: 1.0,
    tierMultiplierSilver: 1.25,
    tierMultiplierGold: 1.5,
  },
  point_rules: {
    pointExpiryDays: 365,
    minWithdrawalPoints: 500,
    rejectionPenaltyPoints: 50,
    autoConvertBonus: true,
  },
  ai_verification: {
    confidenceThreshold: 85,
    autoApproveEnabled: true,
    flagSuspiciousBelow: 50,
    manualOverrideHighValue: true,
  },
  maps_locations: {
    provider: "OpenStreetMap",
    defaultLat: 17.385044,
    defaultLng: 78.486671,
    defaultZoom: 12,
    serviceRadiusKm: 50,
  },
  roles_permissions: {
    activeRoles: ["super_admin", "regional_admin", "field_auditor", "support"],
    manageUsersPermission: true,
    verifyWastePermission: true,
    modifySettingsPermission: true,
  },
  api_keys: {
    activeKeyCount: 3,
    rateLimitPerMinute: 120,
    webhookEnabled: true,
    webhookUrl: "https://api.t2t.com/v1/webhooks/audit",
  },
  audit_logs: {
    retentionDays: 90,
    logFailedLogins: true,
    logDataChanges: true,
    exportFormat: "CSV",
  },
  admin_users: {
    totalAdminsCount: 2,
    autoLockAfterFailedAttempts: 5,
    lockoutDurationMinutes: 15,
  },
  storage: {
    provider: "Supabase Storage",
    maxFileSizeMb: 10,
    allowedFileTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  integrations: {
    resendConfigured: !!process.env.RESEND_API_KEY,
    googleOauthEnabled: true,
    supabaseAuthEnabled: true,
  },
};
