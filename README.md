# AI-Driven Hypertension and Diabetes Prevention and Wellness App

# Research Problem

According to the World Health Organization (WHO), approximately 1.28 billion adults worldwide suffer from hypertension, while over 422 million people are living with diabetes. These conditions are among the leading causes of death globally, contributing to heart disease, stroke, kidney failure, and other severe complications that significantly affect quality of life and life expectancy.

Prevention and early detection are fundamental to managing chronic diseases; however, most individuals in Sri Lanka rely on traditional healthcare approaches that involve periodic checkups and generalized medical advice. This creates major gaps in continuous health monitoring, particularly in areas such as early risk identification, personalized lifestyle management, dietary guidance, and stress control. Although health technology solutions exist, most current mobile applications offer only basic health tracking features and fail to provide accurate, AI-powered risk prediction and personalized interventions for practical, everyday health management.

The motivation for this research is to develop an AI-powered mobile wellness application that bridges this healthcare gap through four core components. The first is a hypertension risk prediction system that analyzes user health data using machine learning models to predict early risks and provide preventive recommendations. The second component is a diabetes risk assessment system designed to evaluate lifestyle factors and health metrics to identify diabetes susceptibility and suggest personalized interventions. The third component is a personalized diet and nutrition guidance system that provides tailored meal plans and dietary recommendations based on individual health profiles. The fourth component is a stress and lifestyle management system, which monitors mental wellness indicators and offers adaptive recommendations for improved overall health.

By integrating these components into a single mobile platform, this research aims to enhance preventive healthcare, promote healthy lifestyle adoption, and empower Sri Lankan individuals through intelligent and personalized mobile health technology.

# Proposed Solution


To address the growing health challenges of hypertension and diabetes among Sri Lankans, this research proposes an AI-powered mobile wellness application that enables continuous health monitoring, early risk prediction, and personalized lifestyle interventions. The solution leverages modern machine learning techniques and data analytics to analyze user health metrics

The proposed system integrates four key components into a single mobile platform. The Hypertension Risk Prediction System enables proactive health management by analyzing key health indicators  lifestyle factors using trained ML models, providing users with personalized risk assessments and preventive recommendations. This allows early intervention without the need for frequent hospital visits or specialist consultations.

The Diabetes Risk Assessment System provides an intelligent evaluation environment where users can input health metrics and lifestyle data to receive real-time diabetes susceptibility analysis. Using predictive analytics, the system offers personalized feedback and intervention strategies, promoting better health awareness and encouraging proactive disease prevention. The Personalized Diet and Nutrition Guidance System enhances user wellness by generating tailored meal plans and dietary recommendations based on individual health profiles, cultural food preferences, and nutritional requirements, ensuring practical and sustainable dietary changes. Additionally, the Stress and Lifestyle Management System supports mental wellness and overall health through mood tracking, stress level monitoring, and adaptive lifestyle recommendations, making health management holistic and user-friendly.

The entire solution is implemented as a cross-platform mobile application using React Native, ensuring accessibility across devices. TensorFlow and Scikit-learn are employed for their efficiency and accuracy in health risk prediction and data analysis, while Firebase supports user authentication, real-time data handling, and notifications. By combining risk prediction, personalized nutrition, stress management, and intelligent health guidance within a single mobile platform, the proposed solution effectively bridges the gap between traditional healthcare and modern digital wellness and contributes to the development of preventive and personalized health technologies for Sri Lanka.


# Main Components

1. AI-Driven Early Hypertension Risk Prediction System
2. Early Diabetes Risk Prediction System
3. AI-Powered Food Recognition and Dietary Recommendation System
4. Domain-Specific AI Health Coach for Stress Management


# 1. AI-Driven Early Hypertension Risk Prediction System

The AI-Driven Early Hypertension Risk Prediction System provides localized, accurate prediction of hypertension risk for Sri Lankan adults, particularly office workers facing elevated risk due to sedentary lifestyles and high stress levels. The system uses machine learning models trained on datasets reflecting Sri Lankan behavioral patterns and dietary habits rather than relying on Western clinical data.

Users input health and lifestyle information through a simple interface, and the AI model analyzes multiple risk factors to generate a personalized risk assessment. A key feature is explainable AI (XAI), which displays the specific factors contributing most significantly to the user's risk score, helping users understand why they are at risk. Based on the predicted risk level, the recommendation engine delivers culturally relevant and practical lifestyle interventions.


# 2. Early Diabetes Risk Prediction System

The Early Diabetes Risk Prediction System addresses the rapid increase in diabetes prevalence among Sri Lankan adults, where approximately 23% of the adult population is affected, yet many remain undiagnosed until complications arise. This component provides accessible diabetes screening without requiring medical devices, laboratory tests, or clinical visits.

The system employs an optimized XGBoost machine learning model, selected for its superior accuracy in classification tasks. The prediction output provides a clear three-tier risk classification: Low Risk (maintain healthy habits), Moderate Risk (lifestyle modification advised), and High Risk (medical consultation urgently needed). Each risk tier is accompanied by specific, actionable medical recommendations.

The FastAPI backend provides secure, reliable, and low-latency prediction services, enabling early identification of at-risk individuals and facilitating timely preventive intervention.


# 3. AI-Powered Food Recognition and Dietary Recommendation System

The AI-Powered Food Recognition System addresses a critical gap in dietary health management for Sri Lankan users who struggle to understand the nutritional content of local meals. Users simply take a photo of their meal using the smartphone camera, and the system instantly identifies the food items using YOLOv8 object detection technology.

The recognized foods are matched against a comprehensive Sri Lankan nutrition database specifically curated to include local dishes and ingredients. The system calculates precise nutrient values including sodium, sugar, fat, and calorie content, providing diabetes-focused and hypertension-focused health assessments.

Real-time alerts are generated using color-coded health indicators: Green (nutritionally balanced), Yellow (monitor intake), and Red (exceeds healthy limits). The system automatically tracks daily intake, providing users with cumulative nutritional insights and historical data visualization to identify problematic dietary habits.


# 4. Domain-Specific AI Health Coach for Stress Management

The Domain-Specific AI Health Coach addresses the often-overlooked connection between mental health, stress, and cardiovascular disease. This component provides an interactive, conversational health coaching experience through natural language interaction.

The system employs sentiment analysis to detect emotional stress in real-time from user conversations. For structured stress evaluation, it administers the validated PSS-10 (Perceived Stress Scale) questionnaire. Based on assessment results, the system predicts stress levels and their potential contribution to hypertension risk.

Critical safety features include crisis keyword detection that identifies expressions of severe distress. When detected, the system immediately provides emergency guidance and mental health crisis resources. By combining conversational AI, validated psychological assessment, and culturally-aware recommendations, this component provides accessible mental health support that addresses hypertension prevention holistically.


# Dependencies

Yolov8

TensorFlow  0.11.0

Scikit-learn (via Python backend API)

Pandas & NumPy (for data preprocessing)

firebase_core

firebase_auth

cloud_firestore

firebase_storage

firebase_database



# Project Members

1. IT22178886 - Rathnayaka L.P.N.K 
2. IT22587756 - Ravindu S.L 
3. IT22587206 - Jayanath M.I.T 
4. IT22623690 - Jayawardhana N.S.G
