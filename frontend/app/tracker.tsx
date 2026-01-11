import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

interface FoodEntry {
  id: string;
  name: string;
  nutrition: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    fiber: number;
    sodium: number;
    sugar: number;
  };
  timestamp: string;
}

interface DailyTotals {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar: number;
}

const STORAGE_KEY = '@daily_intake';

export default function TrackerPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [totals, setTotals] = useState<DailyTotals>({
    calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0
  });

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTodayEntries();
    }, [])
  );

  const getTodayKey = () => {
    const today = new Date();
    return `${STORAGE_KEY}_${today.toISOString().split('T')[0]}`;
  };

  const loadTodayEntries = async () => {
    try {
      const key = getTodayKey();
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const parsed: FoodEntry[] = JSON.parse(data);
        setEntries(parsed);
        calculateTotals(parsed);
      } else {
        setEntries([]);
        setTotals({ calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0 });
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const calculateTotals = (items: FoodEntry[]) => {
    const newTotals = items.reduce((acc, item) => ({
      calories: acc.calories + (item.nutrition?.calories || 0),
      carbs: acc.carbs + (item.nutrition?.carbs || 0),
      protein: acc.protein + (item.nutrition?.protein || 0),
      fat: acc.fat + (item.nutrition?.fat || 0),
      fiber: acc.fiber + (item.nutrition?.fiber || 0),
      sodium: acc.sodium + (item.nutrition?.sodium || 0),
      sugar: acc.sugar + (item.nutrition?.sugar || 0),
    }), { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0 });
    
    setTotals(newTotals);
  };

  const removeEntry = async (id: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const newEntries = entries.filter(e => e.id !== id);
            setEntries(newEntries);
            calculateTotals(newEntries);
            await AsyncStorage.setItem(getTodayKey(), JSON.stringify(newEntries));
          }
        }
      ]
    );
  };

  const clearAll = async () => {
    Alert.alert(
      'Clear All',
      'Are you sure you want to clear all entries for today?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setEntries([]);
            setTotals({ calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0 });
            await AsyncStorage.removeItem(getTodayKey());
          }
        }
      ]
    );
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Daily recommended values (approximate)
  const dailyGoals = {
    calories: 2000,
    carbs: 300,
    protein: 50,
    fat: 65,
  };

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage < 50) return '#4CAF50';
    if (percentage < 80) return '#FF9800';
    return '#f44336';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Intake</Text>
        <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
          <Ionicons name="trash-outline" size={22} color="#f44336" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Date */}
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.calorieCard]}>
            <Text style={styles.summaryValue}>{totals.calories}</Text>
            <Text style={styles.summaryLabel}>Calories</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { 
                width: `${Math.min((totals.calories / dailyGoals.calories) * 100, 100)}%`,
                backgroundColor: getProgressColor(totals.calories, dailyGoals.calories)
              }]} />
            </View>
            <Text style={styles.goalText}>/ {dailyGoals.calories} kcal</Text>
          </View>

          <View style={styles.macroRow}>
            <View style={[styles.macroCard, { borderLeftColor: '#4CAF50' }]}>
              <Text style={styles.macroValue}>{totals.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={[styles.macroCard, { borderLeftColor: '#2196F3' }]}>
              <Text style={styles.macroValue}>{totals.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={[styles.macroCard, { borderLeftColor: '#FF9800' }]}>
              <Text style={styles.macroValue}>{totals.fat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>

          {/* Additional Nutrients */}
          <View style={styles.nutrientRow}>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientValue}>{totals.fiber}g</Text>
              <Text style={styles.nutrientLabel}>Fiber</Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientValue}>{totals.sugar}g</Text>
              <Text style={styles.nutrientLabel}>Sugar</Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientValue}>{totals.sodium}mg</Text>
              <Text style={styles.nutrientLabel}>Sodium</Text>
            </View>
          </View>
        </View>

        {/* Food List */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Today's Foods ({entries.length})</Text>
          
          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No foods logged yet</Text>
              <Text style={styles.emptySubtext}>Scan a food to add it to your tracker</Text>
            </View>
          ) : (
            entries.map((entry) => (
              <View key={entry.id} style={styles.foodItem}>
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{entry.name}</Text>
                  <Text style={styles.foodTime}>{formatTime(entry.timestamp)}</Text>
                </View>
                <View style={styles.foodNutrition}>
                  <Text style={styles.foodCalories}>{entry.nutrition?.calories || 0} kcal</Text>
                  <TouchableOpacity onPress={() => removeEntry(entry.id)}>
                    <Ionicons name="close-circle" size={22} color="#ccc" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Scan Button */}
      <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/scan')}>
        <Ionicons name="scan" size={24} color="white" />
        <Text style={styles.scanBtnText}>Scan Food</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearBtn: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryContainer: {
    marginBottom: 25,
  },
  calorieCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryCard: {},
  summaryValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  macroLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nutrientItem: {
    alignItems: 'center',
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nutrientLabel: {
    fontSize: 12,
    color: '#888',
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  foodTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  foodNutrition: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  scanBtn: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
