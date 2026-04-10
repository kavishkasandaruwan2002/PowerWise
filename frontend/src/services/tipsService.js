import api from './api';

const cleanParams = (params = {}) => {
  const result = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value;
    }
  });
  return result;
};

export const getRecommendations = async (params = {}) => {
  const res = await api.get('/v1/tips/recommendations', { params: cleanParams(params) });
  return res.data;
};

export const getInteractions = async () => {
  const res = await api.get('/v1/tips/interactions');
  return res.data;
};

export const bookmarkTip = async (tipId) => {
  const res = await api.post(`/v1/tips/${tipId}/bookmark`);
  return res.data;
};

export const unbookmarkTip = async (tipId) => {
  const res = await api.post(`/v1/tips/${tipId}/unbookmark`);
  return res.data;
};

export const implementTip = async (tipId) => {
  const res = await api.post(`/v1/tips/${tipId}/implement`);
  return res.data;
};

export const feedbackTip = async (tipId, payload) => {
  const res = await api.post(`/v1/tips/${tipId}/feedback`, payload);
  return res.data;
};

export const dismissTip = async (tipId, payload = { days: 14 }) => {
  const res = await api.post(`/v1/tips/${tipId}/dismiss`, payload);
  return res.data;
};

export const listAdminTips = async (params = {}) => {
  const res = await api.get('/v1/admin-tips', { params: cleanParams(params) });
  return res.data;
};

export const createAdminTip = async (payload) => {
  const res = await api.post('/v1/admin-tips', payload);
  return res.data;
};

export const updateAdminTip = async (tipId, payload) => {
  const res = await api.patch(`/v1/admin-tips/${tipId}`, payload);
  return res.data;
};

export const deactivateAdminTip = async (tipId) => {
  const res = await api.delete(`/v1/admin-tips/${tipId}`);
  return res.data;
};
