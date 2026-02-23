import axios from './axios'

export const householdsApi = {
    getQRCode: async () => {
        const response = await axios.get('/users/household/qr-data')
        return response.data
    },

    downloadQR: async () => {
        const response = await axios.get('/users/household/qr/download', {
            responseType: 'blob',
        })
        return response.data
    },

    getQRToken: async () => {
        const response = await axios.get('/users/household/qr-token')
        return response.data
    },

    regenerateQR: async () => {
        const response = await axios.post('/users/household/qr/regenerate')
        return response.data
    },

    joinHousehold: async (householdId, token) => {
        const response = await axios.post('/users/household/join', { householdId, token })
        return response.data
    },

    leaveHousehold: async () => {
        const response = await axios.post('/users/household/leave')
        return response.data
    },

    downloadHouseholdReport: async () => {
        const response = await axios.get('/users/household/download', {
            responseType: 'blob',
        })
        return response.data
    },
}