export const ROLES = {
    FAMILY_USER: 'family_user',
    ADMIN: 'admin',
    UTILITY_AGENT: 'utility_agent',
}

export const INCOME_LEVELS = {
    LOW: 'low',
    MIDDLE: 'middle',
    HIGH: 'high',
}

export const HOUSEHOLD_TYPES = {
    APARTMENT: 'apartment',
    BOARDING: 'boarding',
    RURAL: 'rural',
    OTHER: 'other',
}

export const TARIFF_TYPES = {
    DOMESTIC: 'domestic',
    RELIGIOUS: 'religious',
    SMALL_BUSINESS: 'small_business',
}

export const BUDGET_REASONS = {
    MANUAL_UPDATE: 'manual_update',
    MONTHLY_RESET: 'monthly_reset',
    ADMIN_ADJUSTMENT: 'admin_adjustment',
    SYSTEM: 'system',
}

export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
}

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh-token',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        ADMIN_REGISTER: '/auth/admin/register',
    },
    USERS: {
        PROFILE: '/users/profile',
        CHANGE_PASSWORD: '/users/change-password',
        DOWNLOAD_PDF: '/users/profile/download',
    },
    BUDGET: {
        HISTORY: '/users/budget/history',
        UPDATE: '/users/budget',
        COMPARISON: '/users/budget/comparison',
        FORECAST: '/users/budget/forecast',
        EXPORT: '/users/budget/export',
    },
    HOUSEHOLD: {
        QR_DATA: '/users/household/qr-data',
        QR_DOWNLOAD: '/users/household/qr/download',
        QR_TOKEN: '/users/household/qr-token',
        REGENERATE_QR: '/users/household/qr/regenerate',
        JOIN: '/users/household/join',
        LEAVE: '/users/household/leave',
        REPORT: '/users/household/download',
    },
    ADMIN: {
        USERS: '/admin/users',
        USER_SEARCH: '/admin/users/search',
        USER_DETAILS: (id) => `/admin/users/${id}`,
        UPDATE_ROLE: (id) => `/admin/users/${id}/role`,
        HOUSEHOLDS: '/admin/households',
        HOUSEHOLD_DETAILS: (id) => `/admin/households/${id}`,
        STATISTICS: '/admin/statistics',
        EXPORT_USERS: '/admin/export/users-csv',
        REPORTS: '/admin/reports/users/download',
    },
}