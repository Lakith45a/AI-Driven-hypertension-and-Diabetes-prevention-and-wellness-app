import json
import time
from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import pickle
import pandas as pd
import joblib

import warnings
warnings.filterwarnings("ignore")


try:
    with open('final_model.pkl', 'rb') as file:
        diabetes_model = pickle.load(file)

except Exception as e:
    print(f"Error loading model/preprocessor: {e}")
    diabetes_model = None


def check_diabetes(df):
    y_pred = diabetes_model.predict(df)
    # print(y_pred[0])
    return y_pred[0]


app = Flask(__name__)
CORS(app)

@app.route('/check_diabetes', methods=['POST'])
def predict_diabetes(): 
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400
    
    keys_list = list(data.keys())
    diabetes_data= [data.get(field) for field in keys_list]

    df_column=['Age', 'Gender', 'Height', 'Weight', 'Waist_Circumference', 'Diet_Food_Habits', 'Blood_Pressure', 'Cholesterol_Lipid_Levels', 'Vision Changes', 'BMI']
    df = pd.DataFrame([diabetes_data], columns=df_column)
    print(diabetes_data)
    try:
        diabetes_status = diabetes_model.predict(df)
        true_label = {0: 'stage_1', 1: 'stage_2', 2: 'stage_3'}    

        return jsonify({"diabetes_status": true_label.get(diabetes_status[0])}), 200    
    except Exception as e:
        return jsonify({"error1": str(e)}), 500      
    

if __name__ == '__main__':
    app.run(debug=True)