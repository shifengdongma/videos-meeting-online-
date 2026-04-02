import api from './client';
export const fetchMeetings = async (params) => {
    const { data } = await api.get('/meetings', { params });
    return data;
};
export const fetchMeetingDetail = async (meetingId) => {
    const { data } = await api.get(`/meetings/${meetingId}`);
    return data;
};
export const createMeeting = async (payload) => {
    const { data } = await api.post('/meetings', payload);
    return data;
};
export const updateMeeting = async (meetingId, payload) => {
    const { data } = await api.put(`/meetings/${meetingId}`, payload);
    return data;
};
export const publishMeeting = async (meetingId, isPublished) => {
    const { data } = await api.put(`/meetings/${meetingId}/publish`, { is_published: isPublished });
    return data;
};
export const deleteMeeting = async (meetingId) => {
    await api.delete(`/meetings/${meetingId}`);
};
// === 参会人员管理 ===
export const fetchParticipants = async (meetingId) => {
    const { data } = await api.get(`/meetings/${meetingId}/participants`);
    return data;
};
export const createParticipant = async (meetingId, payload) => {
    const { data } = await api.post(`/meetings/${meetingId}/participants`, payload);
    return data;
};
export const batchCreateParticipants = async (meetingId, participants) => {
    const { data } = await api.post(`/meetings/${meetingId}/participants/batch`, { participants });
    return data;
};
export const importParticipants = async (meetingId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post(`/meetings/${meetingId}/participants/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
};
export const deleteParticipant = async (meetingId, participantId) => {
    await api.delete(`/meetings/${meetingId}/participants/${participantId}`);
};
export const fetchParticipantTemplate = async (meetingId) => {
    const { data } = await api.get(`/meetings/${meetingId}/participants/template`);
    return data;
};
// === 会议模块管理 ===
export const fetchModules = async (meetingId) => {
    const { data } = await api.get(`/meetings/${meetingId}/modules`);
    return data;
};
export const updateModule = async (meetingId, moduleId, payload) => {
    const { data } = await api.put(`/meetings/${meetingId}/modules/${moduleId}`, payload);
    return data;
};
export const batchUpdateModules = async (meetingId, modules) => {
    const { data } = await api.put(`/meetings/${meetingId}/modules/batch`, { modules });
    return data;
};
