import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Share2, Smartphone } from 'lucide-react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Share Receiver</Text>
        <Text style={styles.subtitle}>Mobile sharing made easy</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.card}>
          <Smartphone color="#0066cc" size={48} />
          <Text style={styles.cardTitle}>Share from Your Phone</Text>
          <Text style={styles.cardDescription}>
            Share URLs directly from Chrome, Instagram, LinkedIn, and other apps to your app.
          </Text>
        </View>

        <View style={styles.card}>
          <Share2 color="#0066cc" size={48} />
          <Text style={styles.cardTitle}>Instant Processing</Text>
          <Text style={styles.cardDescription}>
            Your shared content is instantly captured and ready for analysis.
          </Text>
        </View>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>How to Share</Text>
        <Text style={styles.instructionStep}>1. Open any app with shareable content</Text>
        <Text style={styles.instructionStep}>2. Tap Share or the share icon</Text>
        <Text style={styles.instructionStep}>3. Find and select this app</Text>
        <Text style={styles.instructionStep}>4. Your content is saved automatically</Text>
      </View>

      <Link href="/(tabs)/shares" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Shared Items</Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    gap: 16,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  instructions: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  instructionStep: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
