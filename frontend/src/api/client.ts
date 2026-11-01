import { ApiResponse, Event, EventRegistration, EventStatistics, PaginatedApiResponse, ParticipantDetail, TeacherDashboardStats, User } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  async registerStudent(payload: any): Promise<ApiResponse<{ user: User; token: string }>> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async logout(): Promise<ApiResponse> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return { success: true, message: 'Logged out' };
  },

  async getMe(): Promise<ApiResponse<User>> {
    return request('/auth/me');
  },

  async updateProfile(payload: any): Promise<ApiResponse> {
    return request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Events
  async listEvents(params: Record<string, string | number> = {}): Promise<PaginatedApiResponse<Event>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return request(`/events?${query.toString()}`);
  },

  async getEvent(id: string): Promise<ApiResponse<Event>> {
    return request(`/events/${id}`);
  },

  async createEvent(payload: any): Promise<ApiResponse<{ id: string }>> {
    return request('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateEvent(id: string, payload: any): Promise<ApiResponse> {
    return request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async updateEventStatus(id: string, status: string): Promise<ApiResponse> {
    return request(`/events/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteEvent(id: string): Promise<ApiResponse> {
    return request(`/events/${id}`, {
      method: 'DELETE',
    });
  },

  async uploadPoster(file: File): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData();
    formData.append('poster', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Poster upload failed');
    }
    return data;
  },

  // Student Registrations
  async registerForEvent(eventId: string): Promise<ApiResponse> {
    return request(`/events/${eventId}/register`, {
      method: 'POST',
    });
  },

  async cancelRegistration(eventId: string): Promise<ApiResponse> {
    return request(`/events/${eventId}/register`, {
      method: 'DELETE',
    });
  },

  async getMyRegistrations(): Promise<ApiResponse<EventRegistration[]>> {
    return request('/me/registrations');
  },

  // Teacher Endpoints
  async getTeacherDashboard(): Promise<ApiResponse<TeacherDashboardStats>> {
    return request('/teacher/dashboard');
  },

  async getTeacherEvents(): Promise<ApiResponse<Event[]>> {
    return request('/teacher/events');
  },

  async getEventParticipants(eventId: string, params: Record<string, string | number> = {}): Promise<PaginatedApiResponse<ParticipantDetail>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return request(`/teacher/events/${eventId}/participants?${query.toString()}`);
  },

  async getEventStatistics(eventId: string): Promise<ApiResponse<EventStatistics>> {
    return request(`/teacher/events/${eventId}/statistics`);
  },

  async exportEventParticipantsCSV(eventId: string, eventTitle: string): Promise<void> {
    const res = await fetch(`${API_BASE}/teacher/events/${eventId}/export`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!res.ok) {
      throw new Error('Failed to export CSV');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants_${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
