import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useSupabase } from '../context/SupabaseContext';

const InsightsScreen = () => {
  const { memories } = useSupabase();
  const screenWidth = Dimensions.get('window').width;

  const moodData = memories.reduce((acc, memory) => {
    const mood = memory.metadata?.mood;
    if (mood) {
      const existingMood = acc.find(item => item.name === mood);
      if (existingMood) {
        existingMood.count++;
      } else {
        acc.push({ name: mood, count: 1, color: getRandomColor(), legendFontColor: '#7F7F7F', legendFontSize: 15 });
      }
    }
    return acc;
  }, []);

  const chartConfig = {
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false // optional
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood Insights</Text>
      {moodData.length > 0 ? (
        <PieChart
          data={moodData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          accessor={"count"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          center={[10, 10]}
          absolute
        />
      ) : (
        <Text style={styles.noDataText}>No mood data available to display insights.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fafafa',
    marginBottom: 20,
  },
  noDataText: {
    color: '#a1a1aa',
    fontSize: 16,
    marginTop: 20,
  },
});

export default InsightsScreen;
