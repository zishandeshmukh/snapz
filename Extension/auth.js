import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://your-project.supabase.co',
  'YOUR_ANON_KEY' // Use anon key only
);

let isLoginMode = true;

document.getElementById('toggleLink').addEventListener('click', () => {
  isLoginMode = !isLoginMode;
  document.getElementById('title').textContent = isLoginMode ? 'Welcome Back' : 'Create Account';
  document.getElementById('authBtn').textContent = isLoginMode ? 'Login' : 'Sign Up';
  document.getElementById('toggleLink').textContent = isLoginMode 
    ? "Don't have an account? Sign up" 
    : 'Already have an account? Login';
});

document.getElementById('authBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('error');
  
  errorDiv.textContent = '';
  
  if (!email || !password) {
    errorDiv.textContent = 'Please fill all fields';
    return;
  }

  const { data, error } = isLoginMode
    ? await supabase.auth.signInWithPassword({ email, password })
    : await supabase.auth.signUp({ email, password });

  if (error) {
    errorDiv.textContent = error.message;
  } else {
    // Save session to chrome.storage
    chrome.storage.local.set({ 
      supabaseSession: data.session,
      userId: data.user.id 
    });
    // Redirect to main popup
    window.location.href = 'popup.html';
  }
});