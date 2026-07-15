import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('shinoraa_token');
const user = localStorage.getItem('shinoraa_user') ? JSON.parse(localStorage.getItem('shinoraa_user')) : null;
const partner = localStorage.getItem('shinoraa_partner') ? JSON.parse(localStorage.getItem('shinoraa_partner')) : null;
const relationship = localStorage.getItem('shinoraa_relationship') ? JSON.parse(localStorage.getItem('shinoraa_relationship')) : null;

const initialState = {
  token: token || null,
  user: user || null,
  partner: partner || null,
  relationship: relationship || null,
  loading: false,
  error: null,
  inviteCode: null,
  otpSent: false,
  otpEmail: null,
  theme: localStorage.getItem('shinoraa_theme') || 'light',
  audioEnabled: localStorage.getItem('shinoraa_audio') !== 'false',
  floatingEffect: localStorage.getItem('shinoraa_floating') || 'sakura', // sakura, rain, snow, fireflies, hearts, none
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setAuthSuccess(state, action) {
      const { token, user, partner, relationship } = action.payload;
      state.token = token;
      state.user = user;
      state.partner = partner;
      state.relationship = relationship;
      state.error = null;
      state.otpSent = false;
      
      localStorage.setItem('shinoraa_token', token);
      localStorage.setItem('shinoraa_user', JSON.stringify(user));
      if (partner) localStorage.setItem('shinoraa_partner', JSON.stringify(partner));
      if (relationship) localStorage.setItem('shinoraa_relationship', JSON.stringify(relationship));
    },
    setAuthError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.partner = null;
      state.relationship = null;
      state.error = null;
      state.inviteCode = null;
      state.otpSent = false;
      
      localStorage.removeItem('shinoraa_token');
      localStorage.removeItem('shinoraa_user');
      localStorage.removeItem('shinoraa_partner');
      localStorage.removeItem('shinoraa_relationship');
    },
    setOtpSent(state, action) {
      state.otpSent = action.payload.sent;
      state.otpEmail = action.payload.email;
    },
    setInviteCode(state, action) {
      state.inviteCode = action.payload;
    },
    updateUserProfile(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('shinoraa_user', JSON.stringify(state.user));
    },
    updatePartnerProfile(state, action) {
      state.partner = { ...state.partner, ...action.payload };
      localStorage.setItem('shinoraa_partner', JSON.stringify(state.partner));
    },
    updateRelationship(state, action) {
      state.relationship = { ...state.relationship, ...action.payload };
      localStorage.setItem('shinoraa_relationship', JSON.stringify(state.relationship));
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('shinoraa_theme', state.theme);
    },
    setTheme(state, action) {
      state.theme = action.payload;
      localStorage.setItem('shinoraa_theme', state.theme);
    },
    toggleAudio(state) {
      state.audioEnabled = !state.audioEnabled;
      localStorage.setItem('shinoraa_audio', state.audioEnabled);
    },
    setFloatingEffect(state, action) {
      state.floatingEffect = action.payload;
      localStorage.setItem('shinoraa_floating', action.payload);
    }
  }
});

export const {
  setLoading,
  setAuthSuccess,
  setAuthError,
  logout,
  setOtpSent,
  setInviteCode,
  updateUserProfile,
  updatePartnerProfile,
  updateRelationship,
  toggleTheme,
  setTheme,
  toggleAudio,
  setFloatingEffect
} = authSlice.actions;

export default authSlice.reducer;
