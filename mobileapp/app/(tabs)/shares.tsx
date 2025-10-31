import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import { useState, useEffect } from 'react';

interface SharedItem {
  id: string;
  url: string;
  title?: string;
  description?: string;
  created_at: string;
}

export default function SharesScreen() {
  const [shares, setShares] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShares();
  }, []);

  const loadShares = async () => {
    try {
      setLoading(true);
      // TODO: Fetch from Supabase when database is set up
      // const { data, error } = await supabase
      //   .from('shared_items')
      //   .select('*')
      //   .order('created_at', { ascending: false });
      setShares([]);
    } catch (error) {
      console.error('Error loading shares:', error);
    } finally {
      setLoading(false);
    }
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {
      alert('Unable to open URL');
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading shares...</Text>
      </View>
    );
  }

  if (shares.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Shared Items Yet</Text>
          <Text style={styles.emptyDescription}>
            Share a URL from your phone to see it appear here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {shares.map((share) => (
        <TouchableOpacity
          key={share.id}
          style={styles.shareCard}
          onPress={() => openUrl(share.url)}
          activeOpacity={0.7}
        >
          <View style={styles.shareContent}>
            <Text style={styles.shareTitle} numberOfLines={2}>
              {share.title || 'Shared Link'}
            </Text>
            {share.description && (
              <Text style={styles.shareDescription} numberOfLines={2}>
                {share.description}
              </Text>
            )}
            <Text style={styles.shareUrl} numberOfLines={1}>
              {share.url}
            </Text>
            <Text style={styles.shareDate}>{formatDate(share.created_at)}</Text>
          </View>
          <ExternalLink size={20} color="#0066cc" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    flexGrow: 1,
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  shareCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareContent: {
    flex: 1,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  shareDescription: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
    lineHeight: 18,
  },
  shareUrl: {
    fontSize: 12,
    color: '#0066cc',
    marginBottom: 4,
  },
  shareDate: {
    fontSize: 12,
    color: '#999',
  },
});
