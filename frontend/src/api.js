import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL;

const API = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 30000,
});

// Attach admin JWT if present
API.interceptors.request.use(cfg => {
  const token = sessionStorage.getItem('adminToken');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ── PUBLIC ──
export const getEvents     = ()              => API.get('/events');
export const submitRSVP    = (data)          => API.post('/rsvp', data);
export const getWishes     = ()              => API.get('/wishes');
export const submitWish    = (data)          => API.post('/wishes', data);
export const getGallery    = (cat, page=1)   => API.get(`/images?event=${cat}&page=${page}&limit=30`);
export const uploadImage   = (fd, onProgress)=> API.post('/upload', fd, {
  headers: { 'Content-Type': 'multipart/form-data' },
  onUploadProgress: onProgress,
});
export const uploadPhotos  = (fd, onProgress)=> API.post('/gallery/upload', fd, {
  headers: { 'Content-Type': 'multipart/form-data' },
  onUploadProgress: onProgress,
});
export const likePhoto     = (id)            => API.post(`/gallery/${id}/like`);
export const getVideos     = (cat, page=1)   => API.get(`/videos?category=${cat}&page=${page}`);
export const submitVideo   = (data)          => API.post('/videos', data);
export const likeVideo     = (id)            => API.post(`/videos/${id}/like`);

// ── ADMIN ──
export const adminLogin    = (pw)   => API.post('/admin/login', { password: pw });
export const getAdminStats = ()     => API.get('/admin/stats');
export const getAdminRSVPs = ()     => API.get('/admin/rsvps');
export const getAdminWishes= ()     => API.get('/admin/wishes');
export const deletePhoto   = (id)   => API.delete(`/admin/photos/${id}`);
export const deleteVideo   = (id)   => API.delete(`/admin/videos/${id}`);
export const toggleWish    = (id)   => API.put(`/admin/wishes/${id}/toggle`);
