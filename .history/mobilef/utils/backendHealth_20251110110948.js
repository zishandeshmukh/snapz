// mobilef/utils/backendHealth.js
export const testBackendConnection = async () => {
  try {
    const response = await fetch(`http://10.30.206.76:3001/health`);
    if (response.ok) {
      console.log('✅ Backend is reachable');
      return true;
    }
  } catch (error) {
    console.error('❌ Backend unreachable:', error);
    Alert.alert(
      'Backend Not Connected',
      'The API server at 10.30.206.76:3001 is not running.\n\nPlease:\n1. Start your backend server\n2. Verify IP address in constants.js\n3. Ensure device is on same Wi-Fi'
    );
    return false;
  }
};