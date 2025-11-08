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
  const { memories, fetchMemories } = useSupabase() || { 
    memories: [], 
    fetchMemories: () => {} 
  };

  const openWebApp = () => {
    if (FRONTEND_URL) {
      Linking.canOpenURL(FRONTEND_URL).then(supported => {
        if (supported) {
          Linking.openURL(FRONTEND_URL);
        } else {
          Alert.alert('Error', `Don't know how to open this URL: ${FRONTEND_URL}`);
        }
      });
    } else {
      Alert.alert('Error', 'FRONTEND_URL is not set in constants.js');
    }
  };

  const handleRefresh = async () => {
    Alert.alert('Refreshing', 'Syncing with server...');
    try {
      if (typeof fetchMemories === 'function') {
        await fetchMemories();
      }
      Alert.alert('Success', 'Data synced successfully!');
    } catch (error) {
      console.error('Error syncing data:', error);
      Alert.alert('Error', 'Failed to sync data.');
    }
  };

  const safeMemories = Array.isArray(memories) ? memories : [];
  const favoriteCount = safeMemories.filter(m => m.favorite).length;

  return (
    <ScrollView style={styles.container}>
      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Text style={styles.appName}>SnapMind</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.description}>
            Your personal digital memory assistant. Capture, organize, and search all your important moments from any app.
          </Text>
        </View>
      </View>

      {/* Quick Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.settingItem} onPress={openWebApp}>
          <Ionicons name="globe-outline" size={20} color="#06b6d4" />
          <Text style={styles.settingText}>Open Web App</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#71717a" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleRefresh}>
          <Ionicons name="refresh-outline" size={20} color="#06b6d4" />
          <Text style={styles.settingText}>Sync Data</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#71717a" />
        </TouchableOpacity>
      </View>

      {/* Statistics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.card}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Memories</Text>
            <Text style={styles.statValue}>{safeMemories.length}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Favorites</Text>
            <Text style={styles.statValue}>{favoriteCount}</Text>
          </View>
        </View>
      </View>

      {/* Privacy & Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <View style={styles.card}>
          <View style={styles.privacyItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#34d399" />
            <Text style={styles.privacyText}>
              All your data is stored securely and privately
            </Text>
          </View>
          <View style={styles.privacyItem}>
            <Ionicons name="sync-outline" size={20} color="#34d399" />
            <Text style={styles.privacyText}>
              Synced across all your devices
            </Text>
          </View>
          <View style={styles.privacyItem}>
            <Ionicons name="lock-closed-outline" size={20} color="#34d399" />
            <Text style={styles.privacyText}>
              End-to-end encrypted connections
            </Text>
          </View>
        </View>
      </View>

      {/* How to Share Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How to Share</Text>
        <View style={styles.card}>
          <Text style={styles.howToText}>
            1. Open any app (Instagram, LinkedIn, Twitter, etc.)
          </Text>
          <View style={styles.howToRow}>
            <Text style={styles.howToText}>
              2. Find the Share button (usually 
            </Text>
            <Ionicons name="share-social-outline" size={14} color="#a1a1aa" style={styles.shareIcon} />
            <Text style={styles.howToText}>)</Text>
          </View>
          <Text style={styles.howToText}>
            3. Select "SnapMind" from the share menu
          </Text>
          <Text style={styles.howToText}>
            4. Your content will be saved automatically!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  section: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fafafa',
    marginBottom: 12,
    paddingTop: 16,
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
  howToRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  howToText: {
    fontSize: 14,
    color: '#a1a1aa',
    marginVertical: 6,
    lineHeight: 20,
  },
  shareIcon: {
    marginHorizontal: 4,
  }
});

