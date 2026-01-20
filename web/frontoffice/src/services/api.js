import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api";

// Créer une instance Axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalide ou expiré
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHENTIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

export const authService = {
  /**
   * Connexion d'un utilisateur
   */
  login: async (username, password) => {
    const response = await api.post("/auth/login", { username, password });
    const { token, account, expiresAt } = response.data;

    // Stocker le token et les informations utilisateur
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(account));
    localStorage.setItem("tokenExpires", expiresAt);

    return response.data;
  },

  /**
   * Déconnexion
   */
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("tokenExpires");
    }
  },

  /**
   * Récupérer l'utilisateur courant
   */
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  /**
   * Valider le token
   */
  validateToken: async () => {
    const response = await api.get("/auth/validate");
    return response.data;
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated: () => {
    const token = localStorage.getItem("authToken");
    const expires = localStorage.getItem("tokenExpires");

    if (!token || !expires) return false;

    // Vérifier si le token n'est pas expiré
    return new Date(expires) > new Date();
  },

  /**
   * Récupérer l'utilisateur stocké localement
   */
  getStoredUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPTES
// ═══════════════════════════════════════════════════════════════════════════════

export const accountService = {
  /**
   * Récupérer tous les comptes
   */
  getAll: async () => {
    const response = await api.get("/auth/accounts");
    return response.data;
  },

  /**
   * Récupérer un compte par ID
   */
  getById: async (id) => {
    const response = await api.get(`/auth/accounts/${id}`);
    return response.data;
  },

  /**
   * Créer un nouveau compte
   */
  create: async (data) => {
    const response = await api.post("/auth/accounts", data);
    return response.data;
  },

  /**
   * Récupérer les comptes bloqués
   */
  getLocked: async () => {
    const response = await api.get("/auth/accounts/locked");
    return response.data;
  },

  /**
   * Débloquer un compte
   */
  unlock: async (id) => {
    const response = await api.post(`/auth/accounts/${id}/unlock`);
    return response.data;
  },

  /**
   * Récupérer les comptes non synchronisés Firebase
   */
  getUnsynced: async () => {
    const response = await api.get("/auth/accounts/unsynced");
    return response.data;
  },
};

export default api;
