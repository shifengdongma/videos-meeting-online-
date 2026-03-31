import api from './client';
export const fetchVotes = async (meetingId) => {
    const { data } = await api.get(`/votes/meeting/${meetingId}`);
    return data;
};
export const createVote = async (payload) => {
    const { data } = await api.post('/votes', payload);
    return data;
};
export const submitVote = async (voteId, option_id) => {
    const { data } = await api.post(`/votes/${voteId}/submit`, { option_id });
    return data;
};
export const endVote = async (voteId) => {
    const { data } = await api.put(`/votes/${voteId}/end`);
    return data;
};
