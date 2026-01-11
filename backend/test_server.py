import requests
import os
import glob

# 1. URL of your local server
url = 'http://127.0.0.1:5000/scan'

# --- 🛠️ CONFIGURATION ---
# Want to test a specific downloaded image? Paste the path here!
# Example: 'downloaded_pizza.jpg' or 'C:/Users/Downloads/rice.jpg'
MANUAL_IMAGE_PATH = 'test_image.jpg' 
# ------------------------

# 2. AUTO-DETECT TEST IMAGE
def find_test_image():
    # First, check if the user provided a manual image
    if MANUAL_IMAGE_PATH and os.path.exists(MANUAL_IMAGE_PATH):
        print(f"🎯 Using Manual Image: {MANUAL_IMAGE_PATH}")
        return MANUAL_IMAGE_PATH

    # If not, look for dataset images
    search_patterns = [
        'sl_food_data_final/train/*/*.jpg',  # Classification structure
        'food_dataset/train/images/*.jpg',   # Detection structure
        'sl_food_data/train/*/*.jpg',        # Colab structure
        '**/*.jpg'                           # Any JPG in current folder
    ]
    
    print("🔎 Searching for a test image (Auto-Detect)...")
    for pattern in search_patterns:
        files = glob.glob(pattern, recursive=True)
        valid_files = [f for f in files if "temp_upload" not in f]
        
        if valid_files:
            return valid_files[0] 
    return None

# Attempt to find an image
found_image = find_test_image()

if found_image:
    image_path = found_image
    print(f"✅ Selected image: {image_path}")
else:
    image_path = MANUAL_IMAGE_PATH # Fallback to manual path even if missing to show error

# Check if file exists to avoid errors
if not os.path.exists(image_path):
    print(f"❌ Error: Could not find image at: {image_path}")
    print(f"   -> Please download an image from Google, save it as '{MANUAL_IMAGE_PATH}', and run this again.")
else:
    try:
        # 3. Open the image and send it
        with open(image_path, 'rb') as img:
            print(f"📤 Sending to server at {url}...")
            
            files = {'image': img}
            
            response = requests.post(url, files=files)
            
            # 4. Print the Result
            print("\n✅ SERVER RESPONSE:")
            try:
                print(response.json())
            except requests.exceptions.JSONDecodeError:
                print("⚠️ Response was not JSON. Raw text:", response.text)

    except requests.exceptions.ConnectionError:
        print("\n❌ Connection Error: Is the server running?")
        print("   -> Make sure to run 'python server.py' in a separate terminal first.")