import axios from "axios";

const fallbackApiOrigin = process.env.NODE_ENV === "production"
  ? "https://road-complaint-and-monitoring-system.onrender.com"
  : "http://localhost:5000";

const rawApiBase = (process.env.REACT_APP_API_BASE_URL || fallbackApiOrigin).trim().replace(/\/+$/, "");
const normalizedApiOrigin = rawApiBase.replace(/\/api$/i, "");

export const API_ASSET_BASE_URL = normalizedApiOrigin;
export const API_BASE_URL = `${normalizedApiOrigin}/api`;

const getAuthToken = () => {
  const rawToken = localStorage.getItem("token");

  if (!rawToken) {
    return "";
  }

  let cleaned = String(rawToken).trim().replace(/^"|"$/g, "");
  cleaned = cleaned.replace(/^Bearer\s+/i, "").trim();
  if (!cleaned || cleaned === "null" || cleaned === "undefined") {
    return "";
  }

  return cleaned;
};

// headers function (same rehne de)
const getHeaders = () => {
  const token = getAuthToken();

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text();

  if (!contentType.includes('application/json')) {
    const endpoint = response.url || 'API endpoint';
    throw new Error(`Expected JSON from ${endpoint}, but received non-JSON response.`);
  }

  const data = responseText ? JSON.parse(responseText) : {};
  if (!response.ok) {
    throw new Error(data.error || data.message || 'An error occurred');
  }
  return data;
};

// Auth Service
export const authService = {
  sendOtp: async (email) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error('Please enter a valid email');
    }

    try {
      // Keep endpoint explicit to match backend route and simplify local debugging.
      console.log('[OTP_API] Sending OTP request', { email: normalizedEmail });
      const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, { email: normalizedEmail });
      console.log('[OTP_API] OTP request success', response.data);
      return response.data;
    } catch (error) {
      console.error('[OTP_API] OTP request failed', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      const backend = error?.response?.data || {};
      const message = backend?.details || backend?.error || backend?.message || error.message || 'Failed to send OTP';
      const code = backend?.code ? ` (${backend.code})` : '';
      const debug = backend?.resendApiKey || backend?.resendFrom
        ? ` [resendApiKey=${backend.resendApiKey || "NA"}, resendFrom=${backend.resendFrom || "NA"}]`
        : '';
      const finalMessage = `${message}${code}${debug}`;
      throw new Error(finalMessage);
    }
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  verifyOtp: async (email, otp) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    return handleResponse(response);
  }
};

// Complaint Service
export const complaintService = {
  uploadComplaint: async (formData) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Session expired. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/complaints/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return handleResponse(response);
  },

  analyzeImage: async (imageFile) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Session expired. Please login again.');
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/complaints/analyze-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return handleResponse(response);
  },

  getComplaints: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/complaints?${queryParams}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getComplaintById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  updateComplaint: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }
};

// Admin Service
export const adminService = {
  register: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/admin/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  getComplaints: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/admin/complaints?${queryParams}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getComplaintById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  updateComplaintStatus: async (complaintId, status) => {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  // create additional admin (must be logged in as admin)
  createAdmin: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/admin/create-admin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  deleteComplaint: async (complaintId) => {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/admin/change-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ oldPassword, newPassword })
    });
    return handleResponse(response);
  },

  getAdmins: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/admins`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  deleteAdmin: async (adminId) => {
    const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getPendingAdmins: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/pending-admins`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  approveAdmin: async (adminId) => {
    const response = await fetch(`${API_BASE_URL}/admin/approve/${adminId}`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  declineAdmin: async (adminId) => {
    const response = await fetch(`${API_BASE_URL}/admin/decline/${adminId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/profile`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// Chat Service
export const chatService = {
  sendMessage: async (message) => {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // no auth required for assistant
      body: JSON.stringify({ message })
    });
    return handleResponse(response);
  }
};

// Contact Service
export const contactService = {
  sendMessage: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/auth/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return handleResponse(response);
  }
};

export default API_BASE_URL;
