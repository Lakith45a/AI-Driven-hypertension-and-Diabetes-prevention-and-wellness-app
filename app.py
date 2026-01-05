import streamlit as st
import pandas as pd
import joblib
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from PyPDF2 import PdfReader

# ================= LOAD DATA =================
model = joblib.load("pss_model.pkl")
recommendations_df = pd.read_csv("sri_lanka_stress_recommendations_dataset.csv")

# ================= SESSION STATE =================
if "step" not in st.session_state:
    st.session_state.step = "chat"

if "responses" not in st.session_state:
    st.session_state.responses = []

if "question_index" not in st.session_state:
    st.session_state.question_index = 0


# ================= HELPER FUNCTIONS =================
def analyze_emotion(text):
    analyzer = SentimentIntensityAnalyzer()
    score = analyzer.polarity_scores(text)["compound"]
    if score <= -0.4:
        return "negative"
    elif score >= 0.4:
        return "positive"
    return "neutral"


def detect_crisis(text):
    danger_words = [
        "want to die", "kill myself", "suicide",
        "end my life", "no reason to live"
    ]
    return any(word in text.lower() for word in danger_words)


def predict_stress_pss(answers):
    df = pd.DataFrame([answers], columns=[f"q{i}" for i in range(1, 11)])
    return model.predict(df)[0]


def get_recommendations_from_data(stress_level):
    filtered = recommendations_df[
        recommendations_df["stress_level"] == stress_level
    ]

    selected = (
        filtered
        .groupby("category", group_keys=False)
        .apply(lambda x: x.sample(1))
    )

    order = ["breathing", "meditation", "sleep_plan", "calming_audio", "lifestyle"]
    selected["category"] = pd.Categorical(
        selected["category"], categories=order, ordered=True
    )

    return selected.sort_values("category").head(4)


# ================= UI =================
st.set_page_config("Stress & Mental Wellness Chatbot", "🧠")
st.title("🧠 Stress & Mental Wellness Chatbot")

# ================= SIDEBAR =================
st.sidebar.header("📄 Upload Medical Reports (Optional)")
uploaded_files = st.sidebar.file_uploader(
    "Upload PDF files",
    type=["pdf"],
    accept_multiple_files=True
)

# ================= MAIN CHAT =================
user_input = st.text_input("💬 Talk about how you feel:")

# ---------- STEP 1 ----------
if st.session_state.step == "chat" and user_input:

    if detect_crisis(user_input):
        st.error("💔 I'm really sorry you're feeling this way.")
        st.warning(
            "You are not alone.\n\n"
            "📞 Sri Lanka Suicide Hotline: 1926\n"
            "📞 Sumithrayo: +94 11 269 6666"
        )
        st.stop()

    emotion = analyze_emotion(user_input)
    st.info(f"It sounds like you're feeling **{emotion}**.")

    st.write("Would you like to check your stress level?")
    col1, col2 = st.columns(2)

    if col1.button("Yes"):
        st.session_state.step = "pss"
        st.rerun()

    if col2.button("No"):
        st.success("Okay 😊 I'm here whenever you need.")

# ---------- STEP 2 ----------
elif st.session_state.step == "pss":

    questions = [
        "Upset because something happened unexpectedly?",
        "Unable to control important things?",
        "Felt nervous or stressed?",
        "Felt confident handling personal problems?",
        "Felt things were going your way?",
        "Unable to cope with all tasks?",
        "Able to control irritations?",
        "Felt on top of things?",
        "Angered by things outside your control?",
        "Felt difficulties piling up?"
    ]

    q_index = st.session_state.question_index
    st.subheader(f"Question {q_index + 1} of 10")
    st.write(questions[q_index])

    answer = st.slider("Select (0 = Never, 4 = Very Often)", 0, 4, 2)

    if st.button("Next"):
        st.session_state.responses.append(answer)
        st.session_state.question_index += 1

        if st.session_state.question_index == 10:
            st.session_state.step = "result"

        st.rerun()

# ---------- STEP 3 ----------
elif st.session_state.step == "result":

    stress = predict_stress_pss(st.session_state.responses)

    st.success(f"🧠 Your Stress Level: **{stress.upper()}**")

    st.write("Would you like tips to reduce your stress?")

    col1, col2 = st.columns(2)

    if col1.button("Yes"):
        st.session_state.step = "recommend"
        st.rerun()

    if col2.button("No"):
        st.success("Take care 💙")

# ---------- STEP 4 ----------
elif st.session_state.step == "recommend":

    st.subheader("🌱 Personalized Stress Reduction Tips")

    stress = predict_stress_pss(st.session_state.responses)
    recs = get_recommendations_from_data(stress)

    for _, row in recs.iterrows():
        st.markdown(f"### 🌿 {row['category'].replace('_', ' ').title()}")
        st.write(f"**Recommendation:** {row['recommendation_text']}")
        st.write(f"⏱ Duration: {row['duration_minutes']} minutes")
        st.write(f"📅 Frequency: {row['frequency_per_day']} times/day")
        st.write(f"🕒 Best time: {row['suggested_timing']}")
        st.write(f"📖 Source: {row['source_name']}")
        st.markdown("---")

    st.success("You're doing great 🌟")

# ================= FOOTER =================
st.markdown("---")
st.caption("⚕️ This tool is for awareness only and not a medical diagnosis.")
