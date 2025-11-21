import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/ApiService';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
    token?: string;
  };
}

export const api = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('🔐 Attempting login...');
      console.log('📧 Email:', credentials.email);

      const data = await apiService.login(credentials.email, credentials.password);
      console.log('📦 Response Data:', JSON.stringify(data, null, 2));

      if (data.token) {
        // Store the token and user data
        await AsyncStorage.setItem('@auth_token', data.token);
        await AsyncStorage.setItem('@user_data', JSON.stringify(data.user));
        console.log('✅ Login successful, token stored');
      }

      return {
        success: true,
        message: 'Login successful',
        data: data,
      };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        message: error.message || 'Network error. Please check your connection.',
      };
    }
  },

  /**
   * Register new user
   */
  signUp: async (userData: SignUpRequest): Promise<AuthResponse> => {
    try {
      console.log('📝 Attempting signup...');
      console.log('👤 User Data:', { ...userData, password: '***' });

      const data = await apiService.register(
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.password
      );

      console.log('📦 Response Data:', JSON.stringify(data, null, 2));

      if (data.token) {
        // Store the token and user data
        await AsyncStorage.setItem('@auth_token', data.token);
        await AsyncStorage.setItem('@user_data', JSON.stringify(data.user));
        console.log('✅ Signup successful, token stored');
      }

      return {
        success: true,
        message: 'Registration successful',
        data: data,
      };
    } catch (error: any) {
      console.error('❌ SignUp error:', error);
      return {
        success: false,
        message: error.message || 'Network error. Please check your connection.',
      };
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user_data');
      await AsyncStorage.removeItem('@logged_in');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Get stored auth token
   */
  getAuthToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('@auth_token');
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },

  /**
   * Get stored user data
   */
  getUserData: async (): Promise<any | null> => {
    try {
      const userData = await AsyncStorage.getItem('@user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
    }
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<AuthResponse> => {
    try {
      console.log('✉️ Verifying email...');
      const data = await apiService.verifyEmail(token);
      console.log('✅ Email verified successfully');
      return {
        success: true,
        message: data.message || 'Email verified successfully!',
      };
    } catch (error: any) {
      console.error('❌ Email verification error:', error);
      return {
        success: false,
        message: error.message || 'Email verification failed. Please try again.',
      };
    }
  },

  /**
   * Resend verification email
   */
  resendVerification: async (email: string): Promise<AuthResponse> => {
    try {
      console.log('📧 Resending verification email...');
      const data = await apiService.resendVerification(email);
      console.log('✅ Verification email sent');
      return {
        success: true,
        message: data.message || 'Verification email sent! Please check your inbox.',
      };
    } catch (error: any) {
      console.error('❌ Resend verification error:', error);
      return {
        success: false,
        message: error.message || 'Failed to resend verification email.',
      };
    }
  },

  /**
   * Google Sign-In
   */
  googleSignIn: async (googleData: {
    idToken: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  }): Promise<AuthResponse> => {
    try {
      console.log('🔵 Authenticating with Google...');
      const data = await apiService.googleAuth(googleData);

      if (data.data?.token) {
        // Store the token and user data
        await AsyncStorage.setItem('@auth_token', data.data.token);
        await AsyncStorage.setItem('@user_data', JSON.stringify(data.data.user));
        console.log('✅ Google authentication successful');
      }

      return {
        success: true,
        message: data.message || 'Signed in with Google successfully!',
        data: data.data,
      };
    } catch (error: any) {
      console.error('❌ Google auth error:', error);
      return {
        success: false,
        message: error.message || 'Google authentication failed.',
      };
    }
  },

  /**
   * Facebook Sign-In
   */
  facebookSignIn: async (facebookData: {
    accessToken: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  }): Promise<AuthResponse> => {
    try {
      console.log('🔷 Authenticating with Facebook...');
      const data = await apiService.facebookAuth(facebookData);

      if (data.data?.token) {
        // Store the token and user data
        await AsyncStorage.setItem('@auth_token', data.data.token);
        await AsyncStorage.setItem('@user_data', JSON.stringify(data.data.user));
        console.log('✅ Facebook authentication successful');
      }

      return {
        success: true,
        message: data.message || 'Signed in with Facebook successfully!',
        data: data.data,
      };
    } catch (error: any) {
      console.error('❌ Facebook auth error:', error);
      return {
        success: false,
        message: error.message || 'Facebook authentication failed.',
      };
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<AuthResponse> => {
    try {
      const data = await apiService.getCurrentUser();
      return {
        success: true,
        message: 'User data retrieved',
        data: data.data,
      };
    } catch (error: any) {
      console.error('❌ Get current user error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get user data.',
      };
    }
  },
};
