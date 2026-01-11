from ultralytics import YOLO

# Load your new brain
model = YOLO('best.pt')

# Print the names it knows
print("🤖 AI Classes:", model.names)