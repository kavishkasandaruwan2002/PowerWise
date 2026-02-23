import axios from './axios'

export const adminApi = {
    registerAdmin: async (data) => {
        const response = await axios.post('/auth/admin/register', data)
        return response.data
    },

    getUsers: async (page = 1, limit = 10) => {
        const response = await axios.get('/admin/users', { params: { page, limit } })
        return response.data
    },

    searchUsers: async (query) => {
        const response = await axios.get('/admin/users/search', { params: { q: query } })
        return response.data
    },

    getUserDetails: async (userId) => {
        const response = await axios.get(`/admin/users/${userId}`)
        return response.data
    },

    updateUserRole: async (userId, role) => {
        const response = await axios.patch(`/admin/users/${userId}/role`, { role })
        return response.data
    },

    getHouseholds: async (page = 1, limit = 10) => {
        const response = await axios.get('/admin/households', { params: { page, limit } })
        return response.data
    },

    getHouseholdDetails: async (householdId) => {
        const response = await axios.get(`/admin/households/${householdId}`)
        return response.data
    },

    updateHousehold: async (householdId, data) => {
        const response = await axios.patch(`/admin/households/${householdId}`, data)
        return response.data
    },

    deleteHousehold: async (householdId) => {
        const response = await axios.delete(`/admin/households/${householdId}`)
        return response.data
    },

    getStatistics: async () => {
        const response = await axios.get('/admin/statistics')
        return response.data
    },

    exportUsersCSV: async () => {
        const response = await axios.get('/admin/export/users-csv', {
            responseType: 'blob',
        })
        return response.data
    },

    downloadAllUsersReport: async () => {
        const response = await axios.get('/admin/reports/users/download', {
            responseType: 'blob',
        })
        return response.data
    },
}