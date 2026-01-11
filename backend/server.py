from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from ultralytics import YOLO
from PIL import Image, ImageOps, ImageDraw, ImageFont
import io
import base64
from src.nutrition_engine import get_nutrition_info

app = FastAPI()

# Color palette for bounding boxes (RGB)
BBOX_COLORS = [
    (255, 87, 87),    # Red
    (87, 255, 87),    # Green
    (87, 87, 255),    # Blue
    (255, 255, 87),   # Yellow
    (255, 87, 255),   # Magenta
    (87, 255, 255),   # Cyan
    (255, 165, 87),   # Orange
    (165, 87, 255),   # Purple
]

def draw_bounding_boxes(image: Image.Image, boxes_data: list, names: dict) -> Image.Image:
    """Draw bounding boxes with labels on the image"""
    # Create a copy to draw on
    annotated = image.copy()
    draw = ImageDraw.Draw(annotated)
    
    # Try to use a better font, fall back to default
    try:
        font = ImageFont.truetype("arial.ttf", 16)
        small_font = ImageFont.truetype("arial.ttf", 12)
    except:
        font = ImageFont.load_default()
        small_font = font
    
    # Track colors by class name
    color_map = {}
    color_idx = 0
    
    for box_info in boxes_data:
        cls_id = box_info["cls_id"]
        food_name = names[cls_id]
        conf = box_info["conf"]
        x1, y1, x2, y2 = box_info["coords"]
        portion_grams = box_info.get("portion_grams", 0)
        
        # Assign consistent color per food type
        if food_name not in color_map:
            color_map[food_name] = BBOX_COLORS[color_idx % len(BBOX_COLORS)]
            color_idx += 1
        color = color_map[food_name]
        
        # Draw rectangle (bounding box)
        draw.rectangle([x1, y1, x2, y2], outline=color, width=3)
        
        # Create label text (food name only, no portion)
        label = f"{food_name}"
        
        # Calculate label background size
        bbox = draw.textbbox((0, 0), label, font=font)
        label_width = bbox[2] - bbox[0]
        label_height = bbox[3] - bbox[1]
        
        # Draw label background
        label_y = max(y1 - label_height - 8, 0)
        draw.rectangle([x1, label_y, x1 + label_width + 8, label_y + label_height + 6], fill=color)
        
        # Draw label text
        draw.text((x1 + 4, label_y + 2), label, fill=(255, 255, 255), font=font)
    
    return annotated

def image_to_base64(image: Image.Image) -> str:
    """Convert PIL Image to base64 string"""
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG", quality=85)
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/jpeg;base64,{img_str}"

def generate_health_advice(nutrition: dict) -> list:
    """Generate health advice based on nutrition values"""
    advice = []
    
    # Sodium advice (High if > 400mg per serving)
    sodium = nutrition.get('sodium', 0)
    if sodium > 600:
        advice.append({"type": "warning", "icon": "⚠️", "text": "Very high sodium. May increase blood pressure. Limit intake if you have hypertension."})
    elif sodium > 400:
        advice.append({"type": "caution", "icon": "🧂", "text": "Moderate-high sodium. Consider limiting other salty foods today."})
    elif sodium < 100:
        advice.append({"type": "good", "icon": "✅", "text": "Low sodium content - good for heart health!"})
    
    # Sugar advice (High if > 15g per serving)
    sugar = nutrition.get('sugar', 0)
    if sugar > 30:
        advice.append({"type": "warning", "icon": "⚠️", "text": "Very high sugar. May spike blood sugar levels. Not recommended for diabetics."})
    elif sugar > 15:
        advice.append({"type": "caution", "icon": "🍬", "text": "High sugar content. Monitor your daily sugar intake."})
    elif sugar < 5:
        advice.append({"type": "good", "icon": "✅", "text": "Low sugar - good for blood sugar control!"})
    
    # Fat advice (High if > 15g per serving)
    fat = nutrition.get('fat', 0)
    if fat > 20:
        advice.append({"type": "warning", "icon": "⚠️", "text": "High fat content. Consume in moderation."})
    elif fat > 15:
        advice.append({"type": "caution", "icon": "🍳", "text": "Moderate-high fat. Balance with low-fat meals."})
    
    # Fiber advice (Good if > 3g)
    fiber = nutrition.get('fiber', 0)
    if fiber >= 3:
        advice.append({"type": "good", "icon": "🥬", "text": "Good fiber content - aids digestion!"})
    
    # Protein advice
    protein = nutrition.get('protein', 0)
    if protein >= 10:
        advice.append({"type": "good", "icon": "💪", "text": "Good protein source - helps muscle health!"})
    
    # Potassium advice (Good for heart)
    potassium = nutrition.get('potassium', 0)
    if potassium >= 200:
        advice.append({"type": "good", "icon": "❤️", "text": "Good potassium - supports heart function!"})
    
    # Calorie advice
    calories = nutrition.get('calories', 0)
    if calories > 350:
        advice.append({"type": "caution", "icon": "🔥", "text": "High calorie. Consider portion control."})
    
    # If no specific advice, give general message
    if not advice:
        advice.append({"type": "info", "icon": "ℹ️", "text": "Enjoy in moderation as part of a balanced diet."})
    
    return advice

# 1. Allow connections from your phone
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Load Both Models
print("Loading Models...")
model1 = None
model2 = None

try:
    model1 = YOLO("best.pt") 
    print("Model 1 (best.pt) Loaded!")
except Exception as e:
    print(f"Error loading model 1: {e}")

try:
    model2 = YOLO("best copy.pt")
    print("Model 2 (best copy.pt) Loaded!")
except Exception as e:
    print(f"Error loading model 2: {e}")

if not model1 and not model2:
    print("No models loaded! Server cannot process images.")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    print(f"\nReceived image: {file.filename}")
    return await process_image(file)

@app.post("/scan")
async def scan(image: UploadFile = File(...)):
    print(f"\nReceived image: {image.filename}")
    return await process_image(image)

# Minimum confidence threshold for a reliable prediction
MIN_CONFIDENCE_THRESHOLD = 40  # 40%

# Portion estimation based on food type (grams per unit area percentage)
# Calibrated based on typical Sri Lankan meal portions
# Formula: portion_grams = bbox_area_percentage * multiplier
PORTION_MULTIPLIERS = {
    # Rice items - high density, typically 150-400g servings
    "white rice": 22, "red rice": 22, "basmati rice": 20, "samba rice": 22,
    "basmathi rice": 20, "milk rice": 18, "noodles": 15,
    # Curries - medium density, typically 50-150g servings
    "dhal curry": 12, "fish curry": 15, "meat curry": 16, "chicken curry": 16,
    "bean curry": 10, "bitter gourd curry": 8, "potato curry": 12,
    "potato milkycurry": 12, "brinjal": 10, "vegetable salad": 8,
    "mallum": 8, "sambol": 10,
    # Eggs - fixed portions (~50g per egg)
    "boiled egg": 50, "boiled eggs": 50, "fried egg": 45,
    # Light items
    "pappadam": 3, "pappadams": 3, "lunu miris": 6,
    "fried potato": 10,
    # Default for unknown foods
    "default": 12
}

def get_portion_multiplier(food_name: str) -> float:
    """Get portion multiplier based on food type"""
    clean_name = food_name.lower().replace("_", " ")
    for key, value in PORTION_MULTIPLIERS.items():
        if key in clean_name or clean_name in key:
            return value
    return PORTION_MULTIPLIERS["default"]

def estimate_portion_grams(food_name: str, area_percentage: float, bbox_width: float, bbox_height: float, count: int) -> int:
    """
    Estimate portion in grams based on bounding box area.
    
    Formula: portion = area_percentage * food_multiplier * shape_factor
    
    - area_percentage: bbox area as % of image (0-100)
    - food_multiplier: grams per % area for this food type
    - shape_factor: adjustment for bbox shape (square=1, elongated<1)
    """
    multiplier = get_portion_multiplier(food_name)
    
    # Shape factor: square boxes are more accurate, elongated boxes might overestimate
    aspect_ratio = max(bbox_width, bbox_height) / max(min(bbox_width, bbox_height), 1)
    shape_factor = 1.0 if aspect_ratio < 2 else 0.85
    
    # Base calculation
    estimated_grams = area_percentage * multiplier * shape_factor
    
    # Minimum portion sizes based on food type
    if "rice" in food_name.lower():
        min_portion = 50
    elif "egg" in food_name.lower():
        min_portion = 50 * count  # ~50g per egg
    elif "pappadam" in food_name.lower():
        min_portion = 8 * count  # ~8g per pappadam
    else:
        min_portion = 20
    
    return max(int(estimated_grams), min_portion)

# List of trained food items for user info
TRAINED_FOODS = [
    "Asmi", "Basmati Rice", "Chicken Bun", "Chicken Cutlet", "Chicken Pastry",
    "Chicken Rolls", "Chicken Rotti", "Coca Cola", "Fanta", "Fish Pastry",
    "Iced Coffee", "Kokis", "Konda Kewum", "Milk Rice", "Mun Kewum",
    "Noodles", "Pizza - Cheese Lovers", "Pizza - Hot And Spicy Chicken",
    "Pizza - Sausage Delight", "Pizza - Spicy Veggie With Paneer",
    "Pizza - Veggie Supreme", "Red Rice", "Samba Rice", "Strawberry Milkshake",
    "Vegetable Pastry", "Vegetable Rolls"
]

async def process_image(file: UploadFile):
    """Common image processing logic - handles both classification and detection models"""
    # 3. Read & Fix Image Rotation
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))
    image = ImageOps.exif_transpose(image)
    
    # Get image dimensions for portion estimation
    img_width, img_height = image.size
    img_area = img_width * img_height

    # 4. Try detection model first (Model 2 - best copy.pt), then fall back to classification
    detected_foods = []
    classification_result = None
    all_boxes_for_drawing = []  # Store all boxes for annotation
    model_names = {}  # Store class names mapping
    annotated_image_base64 = None
    
    # Model 2 - Detection Model (for food plates with multiple items)
    if model2:
        try:
            results2 = model2(image, conf=0.25)  # Higher confidence for detection
            if results2 and len(results2[0].boxes) > 0:
                # This is a detection model - extract all detected foods
                result2 = results2[0]
                model_names = result2.names
                food_data = {}
                
                for box in result2.boxes:
                    cls_id = int(box.cls[0])
                    food_name = result2.names[cls_id]
                    conf = float(box.conf[0]) * 100
                    
                    # Calculate bounding box dimensions and area for portion estimation
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    bbox_width = x2 - x1
                    bbox_height = y2 - y1
                    box_area = bbox_width * bbox_height
                    area_percentage = (box_area / img_area) * 100
                    
                    if food_name not in food_data:
                        food_data[food_name] = {
                            "count": 0, 
                            "total_conf": 0, 
                            "total_area": 0,
                            "total_width": 0,
                            "total_height": 0,
                            "boxes": [],
                            "cls_id": cls_id
                        }
                    food_data[food_name]["count"] += 1
                    food_data[food_name]["total_conf"] += conf
                    food_data[food_name]["total_area"] += area_percentage
                    food_data[food_name]["total_width"] += bbox_width
                    food_data[food_name]["total_height"] += bbox_height
                    food_data[food_name]["boxes"].append({
                        "area_pct": area_percentage,
                        "width": bbox_width,
                        "height": bbox_height,
                        "conf": conf,
                        "coords": (x1, y1, x2, y2)
                    })
                
                # Convert to list with average confidence and portion estimation
                for food_name, data in food_data.items():
                    avg_conf = data["total_conf"] / data["count"]
                    total_area = data["total_area"]
                    avg_width = data["total_width"] / data["count"]
                    avg_height = data["total_height"] / data["count"]
                    
                    # Estimate portion based on bounding box area and dimensions
                    portion_grams = estimate_portion_grams(food_name, total_area, avg_width, avg_height, data["count"])
                    
                    detected_foods.append({
                        "name": food_name,
                        "count": data["count"],
                        "confidence": avg_conf,
                        "area_percentage": round(total_area, 1),
                        "portion_grams": portion_grams
                    })
                    
                    # Add boxes for this food to the drawing list with portion info
                    for box_info in data["boxes"]:
                        # Estimate individual box portion
                        individual_portion = estimate_portion_grams(
                            food_name, box_info["area_pct"], 
                            box_info["width"], box_info["height"], 1
                        )
                        all_boxes_for_drawing.append({
                            "cls_id": data["cls_id"],
                            "conf": box_info["conf"],
                            "coords": box_info["coords"],
                            "portion_grams": individual_portion
                        })
                    
                    print(f"Detected: {food_name} - Area: {total_area:.1f}% - Portion: {portion_grams}g")
                
                # Draw bounding boxes on the image
                if all_boxes_for_drawing:
                    annotated_image = draw_bounding_boxes(image, all_boxes_for_drawing, model_names)
                    annotated_image_base64 = image_to_base64(annotated_image)
                    print(f"Generated annotated image with {len(all_boxes_for_drawing)} bounding boxes")
                    
            elif results2 and results2[0].probs:
                # Model 2 is also a classification model
                result2 = results2[0]
                top_index2 = result2.probs.top1
                name2 = result2.names[top_index2]
                conf2 = float(result2.probs.top1conf) * 100
                classification_result = {"name": name2, "confidence": conf2, "source": "model2"}
                print(f"Model 2 (classification): {name2} ({conf2:.1f}%)")
        except Exception as e:
            print(f"Model 2 error: {e}")
    
    # Model 1 - Classification Model (for single food items)
    if model1 and not detected_foods:
        try:
            results1 = model1(image, conf=0.01)
            if results1 and results1[0].probs:
                result1 = results1[0]
                top_index1 = result1.probs.top1
                name1 = result1.names[top_index1]
                conf1 = float(result1.probs.top1conf) * 100
                classification_result = {"name": name1, "confidence": conf1, "source": "model1"}
                print(f"Model 1 (classification): {name1} ({conf1:.1f}%)")
        except Exception as e:
            print(f"Model 1 error: {e}")
    
    # 5. Handle results based on what was detected
    
    # CASE 1: Multiple foods detected on a plate (detection model worked)
    if detected_foods:
        print(f"Food plate detected with {len(detected_foods)} different items!")
        
        # Calculate total nutrition for all detected foods (adjusted by portion)
        total_nutrition = {
            "calories": 0, "carbs": 0, "protein": 0, "fat": 0,
            "fiber": 0, "sodium": 0, "potassium": 0, "sugar": 0
        }
        
        total_portion_grams = 0
        food_details = []
        
        for food in detected_foods:
            nutrition_per_100g = get_nutrition_info(food["name"])
            portion_grams = food.get("portion_grams", 100)
            portion_size = food.get("portion_size", "Medium")
            
            # Calculate nutrition based on estimated portion (nutrition is per 100g)
            portion_multiplier = portion_grams / 100
            
            adjusted_nutrition = {}
            for key in total_nutrition:
                value = nutrition_per_100g.get(key, 0) * portion_multiplier
                adjusted_nutrition[key] = round(value, 1)
                total_nutrition[key] += value
            
            total_portion_grams += portion_grams
            
            food_details.append({
                "name": food["name"],
                "count": food["count"],
                "confidence": int(food["confidence"]),
                "portion_size": portion_size,
                "portion_grams": portion_grams,
                "nutrition": adjusted_nutrition
            })
        
        # Round total nutrition values
        for key in total_nutrition:
            total_nutrition[key] = round(total_nutrition[key], 1)
        
        # Generate advice based on total nutrition
        advice = generate_health_advice(total_nutrition)
        
        # Create a summary name (show all detected foods)
        food_names = [f["name"] for f in detected_foods]
        summary_name = ", ".join(food_names)
        
        avg_confidence = sum(f["confidence"] for f in detected_foods) / len(detected_foods)
        
        response = {
            "name": summary_name,
            "confidence": int(avg_confidence),
            "recognized": True,
            "is_plate": True,
            "foods_detected": food_details,
            "total_items": sum(f["count"] for f in detected_foods),
            "total_portion_grams": total_portion_grams,
            "nutrition": total_nutrition,
            "advice": advice,
            "message": f"Detected {len(detected_foods)} food items (~{total_portion_grams}g total)"
        }
        
        # Add annotated image if available
        if annotated_image_base64:
            response["annotated_image"] = annotated_image_base64
        
        return response
    
    # CASE 2: Single food classification
    if not classification_result:
        return {
            "name": "Not Recognized",
            "confidence": 0,
            "recognized": False,
            "message": "Could not process this image. Please try again with a clearer photo.",
            "suggestions": TRAINED_FOODS[:10]
        }
    
    food_name = classification_result["name"]
    confidence = classification_result["confidence"]
    print(f"Final result: {food_name} ({confidence:.1f}%)")

    # CASE 3: Check if confidence is too low (item not in training data)
    if confidence < MIN_CONFIDENCE_THRESHOLD:
        print(f"Low confidence - item may not be in training data")
        return {
            "name": food_name,
            "confidence": int(confidence),
            "recognized": False,
            "message": f"This food item is not clearly recognized. Our model is trained on Sri Lankan foods and common items.",
            "suggestions": TRAINED_FOODS,
            "tip": "Try scanning one of these items for best results!"
        }

    # 6. Get Nutrition Info from Database
    nutrition = get_nutrition_info(food_name)
    print(f"Nutrition: {nutrition}")

    # 7. Generate Health Advice
    advice = generate_health_advice(nutrition)
    print(f"Advice: {advice}")

    # 8. Return JSON with Nutrition Data and Advice
    return {
        "name": food_name,
        "confidence": int(confidence),
        "recognized": True,
        "nutrition": nutrition,
        "advice": advice
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)