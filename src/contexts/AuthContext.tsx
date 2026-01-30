import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  linkWithCredential,
  EmailAuthProvider,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { firestoreService } from '../lib/firestore';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user');
      
      if (user) {
        // User is signed in
        setUser(user);
        
        // Initialize profile if needed
        try {
          await initializeUserProfile(user);
        } catch (error) {
          console.error('Failed to initialize profile:', error);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleAccountMerging = async (googleUser: User, email: string, existingMethods: string[]) => {
    try {
      // Show a toast asking user to confirm account merging
      const shouldMerge = window.confirm(
        `An account with ${email} already exists. Would you like to merge your Google account with your existing account? This will allow you to sign in with either method.`
      );

      if (!shouldMerge) {
        await signOut(auth);
        toast.info('Sign-in cancelled. You can try again anytime.');
        return;
      }

      // For security, we'll ask the user to verify their password
      const password = window.prompt(
        'To merge accounts, please enter your existing account password:'
      );

      if (!password) {
        await signOut(auth);
        toast.info('Account merging cancelled.');
        return;
      }

      // Sign out the Google user temporarily
      await signOut(auth);

      // Sign in with email/password to verify
      const emailCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Create Google credential
      const googleCredential = GoogleAuthProvider.credential(
        googleUser.getIdToken ? await googleUser.getIdToken() : null
      );

      // Link the Google credential to the existing account
      await linkWithCredential(emailCredential.user, googleCredential);

      toast.success('Accounts successfully merged! You can now sign in with either Google or email/password.');
      await initializeUserProfile(emailCredential.user);

    } catch (error: any) {
      console.error('Account merging error:', error);
      
      if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password. Account merging failed.');
      } else if (error.code === 'auth/credential-already-in-use') {
        toast.error('This Google account is already linked to another account.');
      } else {
        toast.error('Failed to merge accounts. Please try again.');
      }
      
      // Sign out any partial authentication
      await signOut(auth);
    }
  };

  const initializeUserProfile = async (user: User) => {
    try {
      console.log('Initializing user profile for:', user.email);
      
      // Check if user profile exists
      let existingProfile = null;
      try {
        existingProfile = await firestoreService.getProfile?.(user.uid);
      } catch (error) {
        console.log('Profile does not exist yet, will create new one');
      }
      
      if (!existingProfile) {
        const profileData = {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          goals: '',
          timezone: 'UTC',
          onboardingCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log('Creating new profile:', profileData);
        await firestoreService.updateProfile(user.uid, profileData);
        console.log('Profile created successfully');
      } else {
        console.log('Profile already exists');
      }
    } catch (error) {
      console.error('Failed to initialize user profile:', error);
      // Don't show error to user as this is not critical for sign-in
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
      await initializeUserProfile(result.user);
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many failed attempts. Please try again later.');
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password.');
      } else {
        toast.error(error.message || 'Failed to login');
      }
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created successfully!');
      await initializeUserProfile(result.user);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address.');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log('Initiating Google sign-in with popup...');
      const provider = new GoogleAuthProvider();
      
      // Add additional scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      // Set custom parameters
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Use popup for better user experience and easier debugging
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email;
      
      console.log('Google sign-in successful:', email);
      
      if (email) {
        try {
          // Check if there's an existing account with this email
          const signInMethods = await fetchSignInMethodsForEmail(auth, email);
          console.log('Existing sign-in methods for', email, ':', signInMethods);
          
          if (signInMethods.length > 0 && !signInMethods.includes('google.com')) {
            // There's an existing email/password account
            console.log('Found existing email/password account, attempting merge...');
            await handleAccountMerging(user, email, signInMethods);
          } else {
            // New Google account or existing Google account
            console.log('Processing Google account sign-in...');
            toast.success('Successfully signed in with Google!');
            await initializeUserProfile(user);
          }
        } catch (methodsError) {
          console.error('Error checking sign-in methods:', methodsError);
          // If we can't check methods, just proceed with the Google sign-in
          toast.success('Successfully signed in with Google!');
          await initializeUserProfile(user);
        }
      }
      
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      if (error.code === 'auth/popup-blocked') {
        toast.error('Popup was blocked. Please allow popups and try again.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.info('Sign-in was cancelled.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        toast.info('Sign-in was cancelled.');
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized for Google sign-in. Please check your Firebase configuration.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        toast.error('An account already exists with this email. Please sign in with your original method first.');
      } else {
        toast.error(error.message || 'Failed to sign in with Google');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};