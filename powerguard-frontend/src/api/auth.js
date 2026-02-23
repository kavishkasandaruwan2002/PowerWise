import axios from './axios'

export const authApi = {
    login: async (email, password) => {
        const response = await axios.post('/auth/login', { email, password })
        return response.data
    },

    register: async (userData) => {
        const response = await axios.post('/auth/register', userData)
        return response.data
    },

    logout: async () => {
        const response = await axios.post('/auth/logout')
        return response.data
    },

    refreshToken: async (refreshToken) => {
        const response = await axios.post('/auth/refresh-token', { refreshToken })
        return response.data
    },

    forgotPassword: async (email) => {
        const response = await axios.post('/auth/forgot-password', { email })
        return response.data
    },

    resetPassword: async (token, password) => {
        const response = await axios.patch(`/auth/reset-password/${token}`, { password })
        return response.data
    },
}