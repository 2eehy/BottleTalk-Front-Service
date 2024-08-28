import React, { createContext, useState, useEffect, useContext,useMemo } from 'react';
import { Amplify } from 'aws-amplify';
import { signInWithRedirect, signOut, fetchUserAttributes, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { Hub } from 'aws-amplify/utils';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-northeast-2_S8Wt9iz3q',
      userPoolClientId: '1g6c4gte0q2s27cimaun1sckes',
      loginWith: {
        oauth: {
          domain: 'bottletalk-google.auth.ap-northeast-2.amazoncognito.com',
          scopes: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
          redirectSignIn: ['http://localhost:3000'],
          redirectSignOut: ['http://localhost:3000'],
          responseType: 'code'
        }
      }
    }
  }
});

cognitoUserPoolsTokenProvider.setKeyValueStorage(window.localStorage);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);


  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      const session = await fetchAuthSession();
      
      const newUser = { 
        ...currentUser, 
        attributes: { ...userAttributes }, 
        accessToken: session.tokens.accessToken,
        idToken: session.tokens.idToken
      };
      
      setUser(newUser);
      window.localStorage.setItem('user', JSON.stringify(newUser));
    } catch (err) {
      console.log('사용자가 로그인하지 않았습니다:', err);
      setUser(null);
      window.localStorage.removeItem('user');
    } finally {
      
    }
  };

  useEffect(() => {
    checkUser();
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
        case 'tokenRefresh':
        case 'signedIn':
          checkUser();
          break;
        case 'signInWithRedirect_failure':
          console.log('Sign in failure', payload.data);
          
          break;
        case 'signOut':
          setUser(null);
        
          break;
        default:
          break;
      }
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    try {
    
      await signInWithRedirect();
    } catch (err) {
      console.log('로그인 에러:', err);
    
    }
  };

  const logout = async () => {
    try {
   
      await signOut();
      setUser(null);
      window.localStorage.removeItem('user');
      console.log('로그아웃 성공')
    } catch (err) {
      console.log('로그아웃 에러:', err);
    } finally {
      
    }
  };

  const isAuthenticated = useMemo(() => !!user, [user]);

  const value = useMemo(() => ({
    user,
    login,
    logout,
  
    isAuthenticated,
    checkUser
  }), [user, isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};