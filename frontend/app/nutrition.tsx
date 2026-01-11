import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function NutritionPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse the nutrition data passed from result page
  const nutrition = params.nutrition ? JSON.parse(params.nutrition as string) : null;
  const foodName = params.foodName as string || 'Food Item';
  const isPlate = params.isPlate === 'true';
  const advice = params.advice ? JSON.parse(params.advice as string) : [];

  if (!nutrition) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No nutrition data available</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nutrition Details</Text>
        <Text style={styles.foodName}>{foodName}</Text>
      </View>

      {/* Main Nutrition Card */}
      <View style={styles.nutritionCard}>
        <Text style={styles.cardTitle}>Nutritional Information</Text>
        
        {/* Calories - Highlighted */}
        <View style={styles.calorieBox}>
          <Text style={styles.calorieValue}>{nutrition.calories || 0}</Text>
          <Text style={styles.calorieLabel}>Calories (kcal)</Text>
        </View>

        {/* Macronutrients */}
        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{nutrition.protein || 0}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{nutrition.carbs || 0}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{nutrition.fat || 0}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>

        {/* Detailed Nutrients */}
        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>Detailed Breakdown</Text>
          
          <View style={styles.nutrientRow}>
            <Text style={styles.nutrientLabel}>Fiber</Text>
            <Text style={styles.nutrientValue}>{nutrition.fiber || 0}g</Text>
          </View>
          
          <View style={styles.nutrientRow}>
            <Text style={styles.nutrientLabel}>Sugar</Text>
            <Text style={styles.nutrientValue}>{nutrition.sugar || 0}g</Text>
          </View>
          
          <View style={[styles.nutrientRow, styles.highlightRow]}>
            <Text style={styles.nutrientLabel}>Sodium</Text>
            <Text style={[styles.nutrientValue, nutrition.sodium > 400 && styles.warningText]}>
              {nutrition.sodium || 0}mg
            </Text>
          </View>
          
          <View style={styles.nutrientRow}>
            <Text style={styles.nutrientLabel}>Potassium</Text>
            <Text style={styles.nutrientValue}>{nutrition.potassium || 0}mg</Text>
          </View>
        </View>
      </View>

      {/* Health Advice Section */}
      {advice && advice.length > 0 && (
        <View style={styles.adviceCard}>
          <Text style={styles.cardTitle}>Health Insights</Text>
          {advice.map((item: any, index: number) => (
            <View 
              key={index} 
              style={[
                styles.adviceItem,
                item.type === 'warning' && styles.adviceWarning,
                item.type === 'caution' && styles.adviceCaution,
                item.type === 'good' && styles.adviceGood,
              ]}
            >
              <Text style={styles.adviceText}>{item.text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Daily Value Reference */}
      <View style={styles.referenceCard}>
        <Text style={styles.referenceTitle}>Daily Reference Values</Text>
        <Text style={styles.referenceText}>• Sodium: Less than 2,300mg/day</Text>
        <Text style={styles.referenceText}>• Sugar: Less than 25g/day (women), 36g/day (men)</Text>
        <Text style={styles.referenceText}>• Potassium: 2,600-3,400mg/day</Text>
        <Text style={styles.referenceText}>• Fiber: 25-30g/day</Text>
      </View>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back to Results</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  foodName: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  portionText: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  nutritionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  calorieBox: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  calorieLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  detailsSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  highlightRow: {
    backgroundColor: '#fff8e1',
    marginHorizontal: -10,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  nutrientLabel: {
    fontSize: 15,
    color: '#333',
  },
  nutrientValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  warningText: {
    color: '#e74c3c',
  },
  adviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adviceItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  adviceWarning: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  adviceCaution: {
    backgroundColor: '#fff8e1',
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  adviceGood: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  adviceText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  referenceCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  referenceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 10,
  },
  referenceText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  backButton: {
    backgroundColor: '#333',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
