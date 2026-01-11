import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LandingPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Tracker Button - Top Right */}
      <TouchableOpacity 
        style={styles.trackerBtn} 
        onPress={() => router.push('/tracker')}
      >
        <Ionicons name="nutrition" size={24} color="#4CAF50" />
      </TouchableOpacity>

      {/* 1. The Main Image/Logo */}
      <View style={styles.imageContainer}>
        {/* You can replace this URL with a local image later */}
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png' }} 
          style={styles.logo} 
        />
      </View>

      {/* 2. Text Content */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>FoodLens</Text>
        <Text style={styles.subtitle}>
          Instantly recognize food, get calories, and track your nutrition with one click.
        </Text>
      </View>

      {/* 3. The Action Button */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/scan')}
      >
        <Text style={styles.buttonText}>Get Started →</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between', // Spreads items out (Top, Middle, Bottom)
    paddingVertical: 80,
    paddingHorizontal: 30,
  },
  imageContainer: {
    flex: 2,
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#333',
    marginBottom: 10,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#000',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // Android shadow
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  trackerBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});