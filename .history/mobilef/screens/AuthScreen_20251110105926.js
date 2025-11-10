import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSupabase } from '../context/SupabaseContext';

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const { supabase } = useSupabase();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    setShowResend(false);
    
    try {
      if (isSignUp) {
        // ✅ Smart check for existing user
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'exp://10.30.206.76:8081',
          },
        });
        
        if (signUpError) {
          // Check if user already exists
          if (signUpError.message.includes('already registered') || signUpError.message.includes('User already exists')) {
            Alert.alert('Account Exists', 'This email is already registered. Please login.');
            setIsSignUp(false);
          } else {
            throw signUpError;
          }
        } else {
          Alert.alert('Success', 'Check your email for confirmation link!');
        }
      } else {
        // ✅ Login existing user
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('confirm')) {
            setShowResend(true);
            Alert.alert(
              'Email Not Confirmed', 
              'Please confirm your email first.',
              [{ text: 'OK' }]
            );
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) throw error;
      Alert.alert('Success', 'Confirmation email resent!');
      setShowResend(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email first');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'exp://10.30.206.76:8081',
    });
    setLoading(false);
    
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Password reset link sent to your email');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>SnapMind</Text>
        <Text style={styles.subtitle}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#777"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setShowResend(false);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#777"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={isSignUp ? 'password-new' : 'password'}
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {isSignUp ? 'Sign Up' : 'Login'}
          </Text>
        </TouchableOpacity>

        {showResend && (
          <TouchableOpacity 
            style={styles.resendButton} 
            onPress={handleResendConfirmation}
            disabled={loading}
          >
            <Text style={styles.resendText}>Resend Confirmation Email</Text>
          </TouchableOpacity>
        )}
        
        {!isSignUp && (
          <TouchableOpacity onPress={handleResetPassword} disabled={loading}>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={() => {
          setIsSignUp(!isSignUp);
          setShowResend(false);
        }} disabled={loading}>
          <Text style={styles.link}>
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090b',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#06b6d4',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#18181b',
    color: '#fafafa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderColor: '#27272a',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#06b6d4',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendButton: {
    backgroundColor: '#27272a',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#06b6d4',
  },
  resendText: {
    color: '#06b6d4',
    fontSize: 14,
    fontWeight: '600',
  },
  link: {
    color: '#34d399',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AuthScreen;