from ultralytics import YOLO

def train():
    # 1. Load the Model (Classification version)
    model = YOLO('yolov8n-cls.pt') 

    # 2. Train it
    # We point to the folder we created in Phase 4
    print(" Starting Training... (This might take 1-2 hours on a laptop CPU)")
    
    results = model.train(
        data='sl_food_data_final', 
        epochs=3,      
        imgsz=224,     
        project='sl_food_models',
        name='laptop_run'
    )
    
    print("✅ Training Finished!")

if __name__ == '__main__':
    train()