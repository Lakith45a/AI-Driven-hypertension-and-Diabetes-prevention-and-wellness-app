import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const STORAGE_KEY = '@daily_intake';

export default function ResultPage() {
  const { imageUri } = useLocalSearchParams(); 
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [addedToTracker, setAddedToTracker] = useState(false);

  useEffect(() => {
    if (imageUri) {
      analyzeFood(imageUri as string);
    }
  }, [imageUri]);

  const analyzeFood = async (uri: string) => {
    // Use your computer's IP for mobile/emulator, localhost for web
    const SERVER_URL = Platform.OS === 'web' 
      ? 'http://localhost:5001/predict'
      : 'http://192.168.8.104:5001/predict';
    
    try {
      console.log("Sending image to server:", SERVER_URL);
      console.log("Image URI:", uri);
      console.log("Platform:", Platform.OS);

      const formData = new FormData();

      if (Platform.OS === 'web') {
        // Web: Fetch the blob and convert to File
        const response = await fetch(uri);
        const blob = await response.blob();
        const file = new File([blob], 'food.jpg', { type: 'image/jpeg' });
        formData.append('file', file);
      } else {
        // Mobile: Use the URI directly
        // @ts-ignore
        formData.append('file', {
          uri: uri,
          name: 'food.jpg',
          type: 'image/jpeg',
        });
      }
      
      const result = await axios.post(SERVER_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      
      console.log("Server response:", JSON.stringify(result.data, null, 2));
      console.log("Response keys:", Object.keys(result.data || {}));
      Alert.alert("Debug", `Response: ${JSON.stringify(result.data)}`);
      setData(result.data);
    } catch (error: any) {
      console.error("Full error:", error);
      
      let errorMessage = "Could not connect to server";
      if (error.code === 'ECONNREFUSED') {
        errorMessage = "Connection refused. Is the server running?";
      } else if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
        errorMessage = "Connection timed out. Check your IP address and network.";
      } else if (error.response) {
        // Server responded with error
        errorMessage = `Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        // Request made but no response
        errorMessage = "No response from server. Check IP address and ensure phone is on same WiFi.";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getTodayKey = () => {
    const today = new Date();
    return `${STORAGE_KEY}_${today.toISOString().split('T')[0]}`;
  };

  const addToTracker = async () => {
    if (!data || !data.recognized) return;
    
    try {
      const key = getTodayKey();
      const existing = await AsyncStorage.getItem(key);
      const entries = existing ? JSON.parse(existing) : [];
      
      const newEntry = {
        id: Date.now().toString(),
        name: data.name,
        nutrition: data.nutrition,
        timestamp: new Date().toISOString(),
      };
      
      entries.push(newEntry);
      await AsyncStorage.setItem(key, JSON.stringify(entries));
      
      setAddedToTracker(true);
      Alert.alert('Added!', `${data.name} has been added to your daily intake tracker.`);
    } catch (error) {
      console.error('Error adding to tracker:', error);
      Alert.alert('Error', 'Could not add to tracker. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{marginTop: 20}}>Identifying...</Text>
      </View>
    );
  }

  // Check if item was recognized with good confidence
  // recognized is true from server when confidence >= 40%
  const isRecognized = data?.recognized === true;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Show annotated image with bounding boxes if available, otherwise show original */}
      {data?.annotated_image ? (
        <Image source={{ uri: data.annotated_image }} style={styles.image} />
      ) : (
        <Image source={{ uri: imageUri as string }} style={styles.image} />
      )}

      <View style={styles.resultBox}>
        
        {/* SHOW DIFFERENT UI FOR UNRECOGNIZED ITEMS */}
        {!isRecognized ? (
          <View style={styles.notRecognizedBox}>
            <Text style={styles.notRecognizedTitle}>Food Not Recognized</Text>
            <Text style={styles.notRecognizedMessage}>
              This item isn't in our database yet. Please try scanning a different food item.
            </Text>
          </View>
        ) : (
          /* RECOGNIZED ITEM - SHOW NORMAL RESULT */
          <>
            {!data?.is_plate && (
              <>
                <Text style={styles.label}>Detected Item:</Text>
                <Text style={styles.foodName}>{data?.name || "Unknown"}</Text>
              </>
            )}
            
          </>
        )}

        {/* DISPLAY FOOD DETAILS FOR PLATE - Show individual items with portions */}
        {isRecognized && data?.is_plate && data?.foods_detected && (
          <View style={styles.foodDetailsBox}>
            <Text style={styles.foodDetailsTitle}>Food Items Detected</Text>
            {data.foods_detected.map((food: any, index: number) => (
              <View key={index} style={styles.foodDetailItem}>
                <View style={styles.foodDetailHeader}>
                  <Text style={styles.foodDetailName}>{food.name}</Text>
                  <Text style={styles.foodDetailPortion}>{food.portion_grams}g</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* View Nutrition Button - Navigate to nutrition details page */}
        {isRecognized && data?.nutrition && (
          <TouchableOpacity 
            style={styles.nutritionBtn} 
            onPress={() => router.push({
              pathname: '/nutrition',
              params: {
                nutrition: JSON.stringify(data.nutrition),
                foodName: data.name,
                isPlate: data.is_plate ? 'true' : 'false',
                advice: JSON.stringify(data.advice || [])
              }
            })}
          >
            <Text style={styles.nutritionBtnText}>View Nutrition Details</Text>
          </TouchableOpacity>
        )}

        {/* Add to Tracker Button - Only for recognized items */}
        {isRecognized && (
          <TouchableOpacity 
            style={[styles.addTrackerBtn, addedToTracker && styles.addTrackerBtnAdded]} 
            onPress={addToTracker}
            disabled={addedToTracker}
          >
            <Text style={[styles.addTrackerBtnText, addedToTracker && styles.addTrackerBtnTextAdded]}>
              {addedToTracker ? '✓ Added to Tracker' : '+ Add to Daily Tracker'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
            <Text style={styles.btnText}>Scan Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.homeBtn} onPress={() => router.push('/')}>
            <Text style={styles.homeBtnText}>Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 300, resizeMode: 'cover' },
  resultBox: { 
    alignItems: 'center', 
    backgroundColor: 'white', 
    marginTop: -20, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 20,
    paddingBottom: 40
  },
  label: { fontSize: 16, color: '#888', marginBottom: 5 },
  foodName: { fontSize: 32, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  confidence: { fontSize: 18, color: '#4CAF50', marginBottom: 30 },
  nutritionBox: { 
    width: '100%', 
    backgroundColor: '#f5f5f5', 
    borderRadius: 15, 
    padding: 20, 
    marginBottom: 30,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50'
  },
  nutritionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 15,
    textAlign: 'center'
  },
  nutritionRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  nutritionLabel: { 
    fontSize: 14, 
    color: '#666',
    fontWeight: '500'
  },
  nutritionValue: { 
    fontSize: 14, 
    color: '#4CAF50', 
    fontWeight: 'bold'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  btn: { 
    flex: 1,
    backgroundColor: 'black', 
    paddingVertical: 15, 
    paddingHorizontal: 20, 
    borderRadius: 30,
    alignItems: 'center',
  },
  btnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  homeBtn: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
  },
  homeBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Add to Tracker Button
  addTrackerBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  addTrackerBtnAdded: {
    backgroundColor: '#e8f5e9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  addTrackerBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addTrackerBtnTextAdded: {
    color: '#4CAF50',
  },
  
  // Advice Styles
  adviceBox: {
    width: '100%',
    marginBottom: 20,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center'
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  adviceWarning: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  adviceCaution: {
    backgroundColor: '#fff8e1',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  adviceGood: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  adviceIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  adviceText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  
  // Not Recognized Styles
  notRecognizedBox: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  notRecognizedIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  notRecognizedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 10,
    textAlign: 'center',
  },
  notRecognizedMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  lowConfidenceText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  suggestionBox: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  suggestionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  suggestionChipText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '500',
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
  
  // Portion and Food Details Styles
  portionText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 15,
  },
  foodDetailsBox: {
    width: '100%',
    backgroundColor: '#f0f8ff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#2196F3',
  },
  foodDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  foodDetailItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  foodDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  foodDetailName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  foodDetailPortion: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  foodDetailNutrition: {
    marginTop: 5,
  },
  foodDetailNutritionText: {
    fontSize: 12,
    color: '#666',
  },
  nutritionBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  nutritionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});