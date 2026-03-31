import api from './client';
export const fetchLiveStreams = async () => {
    const { data } = await api.get('/live-streams');
    return data;
};
export const fetchLiveStream = async (id) => {
    const { data } = await api.get(`/live-streams/${id}`);
    return data;
};
export const createLiveStream = async (payload) => {
    const { data } = await api.post('/live-streams', payload);
    return data;
};
export const fetchSubVenues = async (streamId) => {
    const { data } = await api.get(`/live-streams/${streamId}/sub-venues`);
    return data;
};
