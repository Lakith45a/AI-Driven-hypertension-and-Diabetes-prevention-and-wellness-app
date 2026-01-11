import pandas as pd
import os

# 1. Setup Paths
base_dir = os.getcwd()
csv_path = os.path.join(base_dir, 'data', 'sl_fcdb_clean.csv')

# 2. Define New Data with Expanded Nutrients (Blood Pressure & Blood Sugar)
# Values are estimated per 100g serving
new_data = [
    # --- WESTERN JUNK FOOD ---
    # Pizza: High Sodium + High Fat (BP Risk)
    {"food_name": "Pizza", "sodium_mg": 640, "potassium_mg": 170, "sugar_g": 3.6, "fiber_g": 2.3, "fat_g": 10.0},
    # Burger: High Fat (BP) + Sugar in bun
    {"food_name": "Burger", "sodium_mg": 950, "potassium_mg": 260, "sugar_g": 5.0, "fiber_g": 1.5, "fat_g": 14.0},
    # Fries: High Fat (BP)
    {"food_name": "Fries", "sodium_mg": 280, "potassium_mg": 350, "sugar_g": 0.5, "fiber_g": 3.0, "fat_g": 15.0},
    # Hot Dog: Processed Meat (High Fat/Salt)
    {"food_name": "Hot Dog", "sodium_mg": 550, "potassium_mg": 100, "sugar_g": 2.0, "fiber_g": 0.0, "fat_g": 12.0},
    # Cola: Extreme Sugar (Blood Sugar Risk)
    {"food_name": "Cola", "sodium_mg": 10, "potassium_mg": 0, "sugar_g": 10.6, "fiber_g": 0.0, "fat_g": 0.0},
    {"food_name": "Orange Soda", "sodium_mg": 20, "potassium_mg": 0, "sugar_g": 12.0, "fiber_g": 0.0, "fat_g": 0.0},

    # --- SRI LANKAN SHORT EATS ---
    # Buns/Pastries: High Carb/Sugar (Blood Sugar) + Margarine (Fat)
    {"food_name": "Chicken Bun", "sodium_mg": 420, "potassium_mg": 110, "sugar_g": 8.0, "fiber_g": 2.0, "fat_g": 12.0},
    {"food_name": "Fish Bun", "sodium_mg": 450, "potassium_mg": 120, "sugar_g": 8.0, "fiber_g": 2.0, "fat_g": 12.0},
    {"food_name": "Fish Pastry", "sodium_mg": 320, "potassium_mg": 70, "sugar_g": 4.0, "fiber_g": 1.0, "fat_g": 18.0},
    {"food_name": "Vegetable Pastry", "sodium_mg": 280, "potassium_mg": 80, "sugar_g": 4.0, "fiber_g": 1.5, "fat_g": 16.0},
    {"food_name": "Chicken Rolls", "sodium_mg": 350, "potassium_mg": 80, "sugar_g": 5.0, "fiber_g": 1.0, "fat_g": 14.0},
    {"food_name": "Vegetable Rolls", "sodium_mg": 300, "potassium_mg": 90, "sugar_g": 5.0, "fiber_g": 1.5, "fat_g": 12.0},
    {"food_name": "Cutlets, fish", "sodium_mg": 280, "potassium_mg": 90, "sugar_g": 2.0, "fiber_g": 1.5, "fat_g": 15.0},
    {"food_name": "Patties, fish", "sodium_mg": 300, "potassium_mg": 60, "sugar_g": 3.0, "fiber_g": 1.0, "fat_g": 16.0},
    {"food_name": "ROTI, VEGETABLE", "sodium_mg": 300, "potassium_mg": 80, "sugar_g": 2.0, "fiber_g": 3.0, "fat_g": 8.0},

    # --- TRADITIONAL SWEETS (Blood Sugar & Fat Spikes) ---
    # Kokis: Deep Fried (High Fat)
    {"food_name": "KOKIS", "sodium_mg": 180, "potassium_mg": 50, "sugar_g": 2.0, "fiber_g": 1.0, "fat_g": 35.0},
    # Asmi/Kewum: Syrup (High Sugar) + Oil (Fat)
    {"food_name": "Asmi", "sodium_mg": 100, "potassium_mg": 40, "sugar_g": 40.0, "fiber_g": 0.5, "fat_g": 20.0},
    {"food_name": "KONDA KEVUM", "sodium_mg": 50, "potassium_mg": 60, "sugar_g": 30.0, "fiber_g": 1.0, "fat_g": 18.0},
    {"food_name": "MUN KEVUM", "sodium_mg": 40, "potassium_mg": 80, "sugar_g": 35.0, "fiber_g": 2.0, "fat_g": 15.0},
    {"food_name": "Murukku", "sodium_mg": 400, "potassium_mg": 50, "sugar_g": 1.0, "fiber_g": 2.0, "fat_g": 25.0}
]

def append_data():
    if not os.path.exists(csv_path):
        print(f"❌ Error: Could not find database at {csv_path}")
        return

    # Load existing DB
    df = pd.read_csv(csv_path)
    print(f"Original Row Count: {len(df)}")
    print(f"Original Columns: {df.columns.tolist()}")

    # Create DataFrame from new data
    new_df = pd.DataFrame(new_data)

    # Filter out items that might already exist
    existing_names = df['food_name'].astype(str).str.lower().tolist()
    new_df = new_df[~new_df['food_name'].str.lower().isin(existing_names)]

    if new_df.empty:
        print("⚠️ No new items to add (names already exist).")
    else:
        # Combine
        # Note: This will automatically add 'sugar_g', 'fiber_g', 'fat_g' columns 
        # to your main database. Existing rows will get 0 (or NaN) for these new columns.
        updated_df = pd.concat([df, new_df], ignore_index=True)
        
        # Fill any NaNs created with 0 (cleaner for the API)
        updated_df = updated_df.fillna(0)
        
        updated_df.to_csv(csv_path, index=False)
        print(f"✅ Success! Added {len(new_df)} new high-risk items.")
        print(f"New Row Count: {len(updated_df)}")
        print(f"New Columns Added: sugar_g, fiber_g, fat_g")
        print("\nSample of added items:")
        print(new_df[['food_name', 'sugar_g', 'fat_g']].head().to_string(index=False))

# ============ MOCK USER UPLOAD DATA ============
mock_user_uploads = [
    # User 1: Multiple Pizza uploads
    {
        "user_id": "user_001",
        "upload_id": "upload_001",
        "filename": "pizza_lunch.jpg",
        "detected_food": "Pizza - Cheese Lovers",
        "confidence": 92,
        "timestamp": "2024-01-05T12:30:00",
        "meal_type": "lunch",
        "nutrition": {
            "sodium_mg": 640,
            "potassium_mg": 170,
            "sugar_g": 3.6,
            "fiber_g": 2.3,
            "fat_g": 10.0
        }
    },
    {
        "user_id": "user_001",
        "upload_id": "upload_002",
        "filename": "pizza_dinner.jpg",
        "detected_food": "Pizza - Spicy Veggie With Paneer",
        "confidence": 88,
        "timestamp": "2024-01-05T19:00:00",
        "meal_type": "dinner",
        "nutrition": {
            "sodium_mg": 620,
            "potassium_mg": 180,
            "sugar_g": 4.0,
            "fiber_g": 2.5,
            "fat_g": 11.0
        }
    },
    # User 2: Mixed meals
    {
        "user_id": "user_002",
        "upload_id": "upload_003",
        "filename": "breakfast_bun.jpg",
        "detected_food": "Chicken Bun",
        "confidence": 95,
        "timestamp": "2024-01-05T08:15:00",
        "meal_type": "breakfast",
        "nutrition": {
            "sodium_mg": 420,
            "potassium_mg": 110,
            "sugar_g": 8.0,
            "fiber_g": 2.0,
            "fat_g": 12.0
        }
    },
    {
        "user_id": "user_002",
        "upload_id": "upload_004",
        "filename": "lunch_rice.jpg",
        "detected_food": "Basmati Rice",
        "confidence": 91,
        "timestamp": "2024-01-05T12:45:00",
        "meal_type": "lunch",
        "nutrition": {
            "sodium_mg": 2,
            "potassium_mg": 92,
            "sugar_g": 0.3,
            "fiber_g": 0.6,
            "fat_g": 0.3
        }
    },
    {
        "user_id": "user_002",
        "upload_id": "upload_005",
        "filename": "snack_soda.jpg",
        "detected_food": "Coca Cola",
        "confidence": 97,
        "timestamp": "2024-01-05T15:30:00",
        "meal_type": "snack",
        "nutrition": {
            "sodium_mg": 10,
            "potassium_mg": 0,
            "sugar_g": 10.6,
            "fiber_g": 0.0,
            "fat_g": 0.0
        }
    },
    # User 3: Sweet treats
    {
        "user_id": "user_003",
        "upload_id": "upload_006",
        "filename": "sweet_kokis.jpg",
        "detected_food": "KOKIS",
        "confidence": 89,
        "timestamp": "2024-01-05T14:00:00",
        "meal_type": "dessert",
        "nutrition": {
            "sodium_mg": 180,
            "potassium_mg": 50,
            "sugar_g": 2.0,
            "fiber_g": 1.0,
            "fat_g": 35.0
        }
    },
    {
        "user_id": "user_003",
        "upload_id": "upload_007",
        "filename": "sweet_asmi.jpg",
        "detected_food": "Asmi",
        "confidence": 86,
        "timestamp": "2024-01-05T17:30:00",
        "meal_type": "dessert",
        "nutrition": {
            "sodium_mg": 100,
            "potassium_mg": 40,
            "sugar_g": 40.0,
            "fiber_g": 0.5,
            "fat_g": 20.0
        }
    }
]

def show_mock_user_uploads():
    """Display mock user upload data in a formatted way"""
    import json
    
    print("\n" + "="*80)
    print("📱 MOCK USER UPLOAD DATA - SL FoodLens")
    print("="*80)
    
    for upload in mock_user_uploads:
        print(f"\n{'─'*80}")
        print(f"User ID: {upload['user_id']} | Upload: {upload['upload_id']}")
        print(f"Filename: {upload['filename']}")
        print(f"Detected Food: {upload['detected_food']} (Confidence: {upload['confidence']}%)")
        print(f"Timestamp: {upload['timestamp']} | Meal Type: {upload['meal_type']}")
        print(f"\nNutrition (per 100g):")
        for nutrient, value in upload['nutrition'].items():
            unit = "mg" if nutrient in ['sodium_mg', 'potassium_mg'] else "g"
            print(f"  • {nutrient.replace('_', ' ').title()}: {value}{unit}")
    
    print(f"\n{'='*80}")
    print(f"Total Uploads: {len(mock_user_uploads)} | Unique Users: {len(set(u['user_id'] for u in mock_user_uploads))}")
    print("="*80 + "\n")
    
    return mock_user_uploads

if __name__ == "__main__":
    # Show mock user uploads
    show_mock_user_uploads()
    
    # Optionally append new data to database
    # append_data()