import { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Icons for better UI

export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const router = useRouter();
  
  // State to hold the photo temporarily
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: 'white', marginBottom: 10 }}>Camera access needed</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btn}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 1. Capture Photo (Don't navigate yet, just show preview)
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
        if (photo) {
          setPreviewUri(photo.uri); // Switch to Preview Mode
        }
      } catch (e) {
        Alert.alert("Error", "Failed to take picture");
      }
    }
  };

  // 2. Pick from Gallery (Switch to Preview Mode)
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  // 3. The "Get Result" Action
  const handleGetResult = () => {
    if (previewUri) {
      // Send the image to the Result Page
      router.push({
        pathname: '/result',
        params: { imageUri: previewUri }
      });
      setPreviewUri(null); // Reset for next time
    }
  };

  return (
    <View style={styles.container}>
      
      {/* MODE 1: PREVIEW (Photo is taken) */}
      {previewUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: previewUri }} style={styles.fullScreenImage} />
          
          {/* Action Buttons Overlay */}
          <View style={styles.previewControls}>
            <TouchableOpacity onPress={() => setPreviewUri(null)} style={styles.retakeBtn}>
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleGetResult} style={styles.getResultBtn}>
              <Text style={styles.getResultText}>Get Result →</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* MODE 2: CAMERA (Live View) */
        <CameraView style={styles.camera} ref={cameraRef} facing="back">
          <View style={styles.topOverlay}>
            <Text style={styles.scanText}>Scan your food</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity onPress={pickImage} style={styles.galleryBtn}>
              <Ionicons name="images" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={takePicture} style={styles.shutterBtn}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            <View style={{width: 50}} />
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  
  // Camera Styles
  camera: { flex: 1, justifyContent: 'flex-end' },
  topOverlay: { position: 'absolute', top: 60, width: '100%', alignItems: 'center' },
  scanText: { color: 'white', fontSize: 18, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 5 },
  controls: { 
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', 
    paddingBottom: 50, backgroundColor: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', paddingTop: 20 
  },
  shutterBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white', borderWidth: 2, borderColor: 'black' },
  galleryBtn: { padding: 15, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 50 },
  btn: { backgroundColor: 'white', padding: 15, borderRadius: 8 },
  btnText: { color: 'black', fontWeight: 'bold' },

  // Preview Mode Styles
  previewContainer: { flex: 1, backgroundColor: 'black' },
  fullScreenImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  previewControls: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 30,
    backgroundColor: 'rgba(0,0,0,0.5)', // Dark background for buttons
    paddingBottom: 50
  },
  retakeBtn: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  retakeText: { color: 'white', fontSize: 16, fontWeight: '600' },
  getResultBtn: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    backgroundColor: '#4CAF50', // Green color for action
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  getResultText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});