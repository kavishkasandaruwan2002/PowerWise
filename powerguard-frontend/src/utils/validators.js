/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export const validatePassword = (password) => {
    const errors = []

    if (password.length < 6) {
        errors.push('Password must be at least 6 characters')
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number')
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}

/**
 * Validate household size
 * @param {number} size - Household size
 * @returns {boolean} Is valid
 */
export const isValidHouseholdSize = (size) => {
    return Number.isInteger(size) && size >= 1 && size <= 20
}

/**
 * Validate budget amount
 * @param {number} amount - Budget amount
 * @returns {boolean} Is valid
 */
export const isValidBudgetAmount = (amount) => {
    return !isNaN(amount) && amount >= 0 && amount <= 1000000
}

/**
 * Validate month/year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {boolean} Is valid
 */
export const isValidMonthYear = (month, year) => {
    return month >= 1 && month <= 12 && year >= 2000 && year <= 2100
}