import axios from './axios'

export const usersApi = {
    getProfile: async () => {
        const response = await axios.get('/users/profile')
        return response.data
    },

    updateProfile: async (data) => {
        const response = await axios.patch('/users/profile', data)
        return response.data
    },

    changePassword: async (currentPassword, newPassword) => {
        const response = await axios.patch('/users/change-password', {
            currentPassword,
            newPassword,
        })
        return response.data
    },

    deleteAccount: async () => {
        const response = await axios.delete('/users/profile')
        return response.data
    },

    downloadProfilePDF: async () => {
        const response = await axios.get('/users/profile/download', {
            responseType: 'blob',
        })
        return response.data
    },
}