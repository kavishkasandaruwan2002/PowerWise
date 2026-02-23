import axios from './axios'

export const budgetApi = {
    getHistory: async (page = 1, limit = 12, startDate, endDate) => {
        const params = { page, limit }
        if (startDate) params.startDate = startDate
        if (endDate) params.endDate = endDate

        const response = await axios.get('/users/budget/history', { params })
        return response.data
    },

    updateBudget: async (budgetAmount, notes = '') => {
        const response = await axios.patch('/users/budget', { budgetAmount, notes })
        return response.data
    },

    getComparison: async () => {
        const response = await axios.get('/users/budget/comparison')
        return response.data
    },

    getForecast: async () => {
        const response = await axios.get('/users/budget/forecast')
        return response.data
    },

    exportCSV: async () => {
        const response = await axios.get('/users/budget/export', {
            responseType: 'blob',
        })
        return response.data
    },
}