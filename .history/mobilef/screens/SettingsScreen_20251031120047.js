import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FRONTEND_URL } from '../utils/constants';
import { useSupabase } from '../context/SupabaseContext';

export default function SettingsScreen() {
  const { memories, fetchMemories } = useSupabase();

  const openWebApp = () => {
    Linking.openURL(FRONTEND_URL);
  };

  const handleRefresh = async () => {
    Alert.alert('Refreshing', 'Syncing with server...');
    await fetchMemories();
    Alert.alert('Success', 'Data synced successfully!');
  };

  return (
    
      
        About
        
          SnapMind
          Version 1.0.0
          
            Your personal digital memory assistant. Capture, organize, and search all your important moments from any app.
          
        
      

      
        Quick Actions
        
          
          Open Web App
          
        

        
          
          Sync Data
          
        
      

      
        Statistics
        
          
            Total Memories
            {memories.length}
          
          
            Favorites
            
              {memories.filter(m => m.favorite).length}
            
          
        
      

      
        Privacy & Security
        
          
            
            
              All your data is stored securely and privately
            
          
          
            
            
              Synced across all your devices
            
          
          
            
            
              End-to-end encrypted connections
            
          
        
      

      
        How to Share
        
          
            1. Open any app (Instagram, LinkedIn, Twitter, etc.)
          
          
            2. Find the Share button (usually )
          
          
            3. Select "SnapMind" from the share menu
          
          
            4. Your content will be saved automatically!
          
        
      
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fafafa',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#06b6d4',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#a1a1aa',
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 8,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#fafafa',
    marginLeft: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    color: '#a1a1aa',
    marginLeft: 12,
  },
  howToText: {
    fontSize: 14,
    color: '#a1a1aa',
    marginVertical: 6,
    lineHeight: 20,
  },
});