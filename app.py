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
    with open('RF_model.pkl', 'rb') as file:
        hypertension_model = pickle.load(file)

    loaded_preprocessor = joblib.load('preprocessor.pkl')

except Exception as e:
    print(f"Error loading model/preprocessor: {e}")
    hypertension_model = None
    loaded_preprocessor = None


def check_hypertension(df):
    x =loaded_preprocessor.transform(df) 
    y_pred = hypertension_model.predict(x)
    # print(y_pred[0])
    return y_pred[0]


app = Flask(__name__)
CORS(app)

@app.route('/check_hypertension', methods=['POST'])
def predict_hypertension(): 
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400
    
    keys_list = list(data.keys())
    hypertension_data= [data.get(field) for field in keys_list]

    df_column=['Age', 'Salt_Intake', 'Stress_Score', 'BP_History', 'Sleep_Duration', 'BMI', 'Family_History', 'Smoking_Status']
    df = pd.DataFrame([hypertension_data], columns=df_column)
    print(hypertension_data)

    try:
        hypertension_status = check_hypertension(df)    

        return jsonify({"hypertension_status": hypertension_status})
    except Exception as e:
        return jsonify({"error": str(e)}), 500      
    

if __name__ == '__main__':
    app.run(debug=True)