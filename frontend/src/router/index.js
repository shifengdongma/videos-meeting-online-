import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
const MainLayout = () => import('../views/MainLayout.vue');
const AdminLayout = () => import('../views/admin/AdminLayout.vue');
const LoginView = () => import('../views/auth/LoginView.vue');
const RegisterView = () => import('../views/auth/RegisterView.vue');
const DashboardView = () => import('../views/DashboardView.vue');
const LiveListView = () => import('../views/live/LiveListView.vue');
const LiveRoomView = () => import('../views/live/LiveRoomView.vue');
const MeetingListView = () => import('../views/meeting/MeetingListView.vue');
const MeetingRoomView = () => import('../views/meeting/MeetingRoomView.vue');
const PlaybackCenterView = () => import('../views/PlaybackCenterView.vue');
const RoomTemplateView = () => import('../views/admin/RoomTemplateView.vue');
const UserManageView = () => import('../views/admin/UserManageView.vue');
const MeetingManageView = () => import('../views/admin/MeetingManageView.vue');
const routes = [
    { path: '/login', component: LoginView, meta: { public: true } },
    { path: '/register', component: RegisterView, meta: { public: true } },
    {
        path: '/',
        component: MainLayout,
        children: [
            { path: '', redirect: '/dashboard' },
            { path: 'dashboard', component: DashboardView },
            { path: 'meetings', component: MeetingListView },
            { path: 'meetings/:id', component: MeetingRoomView },
            { path: 'live', component: LiveListView },
            { path: 'live/:id', component: LiveRoomView },
            { path: 'playback', component: PlaybackCenterView }
        ]
    },
    {
        path: '/admin',
        component: AdminLayout,
        meta: { roles: ['admin'] },
        children: [
            { path: 'users', component: UserManageView },
            { path: 'rooms', component: RoomTemplateView },
            { path: 'meetings', component: MeetingManageView, meta: { roles: ['admin', 'host'] } }
        ]
    }
];
const router = createRouter({
    history: createWebHistory(),
    routes
});
router.beforeEach(async (to) => {
    const authStore = useAuthStore();
    if (to.meta.public) {
        return true;
    }
    if (!authStore.token) {
        return '/login';
    }
    if (!authStore.user) {
        await authStore.restore();
    }
    const roles = to.meta.roles;
    if (roles && authStore.role && !roles.includes(authStore.role)) {
        return '/meetings';
    }
    return true;
});
export default router;
