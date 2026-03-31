import api from './client';
export const fetchMeetingPlaybacks = async () => {
    const { data } = await api.get('/meetings');
    return data.filter(item => item.record_url).map(item => ({
        id: item.id,
        title: item.title,
        record_url: item.record_url,
        start_time: item.start_time,
        type: 'meeting'
    }));
};
export const fetchLivePlaybacks = async () => {
    const { data } = await api.get('/live-streams');
    return data.filter(item => item.record_url).map(item => ({
        id: item.id,
        title: item.title,
        record_url: item.record_url,
        start_time: item.start_time,
        type: 'live'
    }));
};
export const fetchAllPlaybacks = async () => {
    const meetings = await fetchMeetingPlaybacks();
    const lives = await fetchLivePlaybacks();
    return [...meetings, ...lives].sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
};
