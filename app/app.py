import streamlit as st
import joblib
import pandas as pd
import numpy as np
import shap
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use("Agg")

# ── Page Configuration ────────────────────────────────────────────────────────
st.set_page_config(
    page_title="CreditWise | Loan Approval AI",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ── Custom CSS ────────────────────────────────────────────────────────────────
st.markdown("""
<style>

    html, body, [class*="css"] {
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        background-color: #f5f5f7;
        color: #1d1d1f;
    }

    .main {
        background-color: #f5f5f7;
    }

    .block-container {
        padding-top: 2rem;
        max-width: 1200px;
    }

    /* HERO */

    .hero-container {
        background: white;
        border-radius: 32px;
        padding: 56px 48px;
        text-align: center;
        margin-bottom: 32px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        border: none;
    }

    .hero-container::before {
        display: none;
    }

    .hero-badge {
        display: inline-block;
        background: #f2f2f7;
        color: #6e6e73;
        padding: 8px 16px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 20px;
        border: none;
    }

    .hero-title {
        font-size: 56px;
        font-weight: 700;
        color: #1d1d1f;
        line-height: 1.05;
        margin-bottom: 16px;
        letter-spacing: -2px;
    }

    .hero-title span {
        color: #0071e3;
    }

    .hero-subtitle {
        font-size: 18px;
        color: #6e6e73;
        max-width: 650px;
        margin: 0 auto 30px;
        line-height: 1.6;
    }

    /* STATS */

    .stats-row {
        display: flex;
        justify-content: center;
        gap: 40px;
        flex-wrap: wrap;
    }

    .stat-item {
        text-align: center;
    }

    .stat-number {
        font-size: 28px;
        font-weight: 700;
        color: #1d1d1f;
    }

    .stat-label {
        font-size: 12px;
        color: #86868b;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: 6px;
    }

    /* SECTION HEADER */

    .section-header {
        font-size: 14px;
        font-weight: 600;
        color: #6e6e73;
        margin-bottom: 18px;
        letter-spacing: 0.4px;
    }

    /* FORM CARDS */

    .form-card {
        background: white;
        border-radius: 24px;
        padding: 28px;
        margin-bottom: 18px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        border: none;
    }

    .form-card-title {
        font-size: 18px;
        font-weight: 600;
        color: #1d1d1f;
        margin-bottom: 22px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    /* RESULT CARDS */

    .result-approved,
    .result-rejected {
        background: white;
        border-radius: 28px;
        padding: 42px;
        text-align: center;
        box-shadow: 0 2px 16px rgba(0,0,0,0.05);
        border: none;
    }

    .result-icon {
        font-size: 54px;
        margin-bottom: 14px;
    }

    .result-title {
        font-size: 38px;
        font-weight: 700;
        margin-bottom: 10px;
    }

    .result-approved .result-title {
        color: #34c759;
    }

    .result-rejected .result-title {
        color: #ff3b30;
    }

    .result-subtitle {
        font-size: 17px;
        color: #6e6e73;
        line-height: 1.6;
    }

    /* CONFIDENCE */

    .confidence-label {
        font-size: 13px;
        color: #86868b;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .confidence-value {
        font-size: 42px;
        font-weight: 700;
        color: #0071e3;
    }

    /* INSIGHTS */

    .insight-card {
        background: white;
        border-radius: 18px;
        padding: 18px 20px;
        margin-bottom: 12px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    }

    .insight-positive {
        border-left: 4px solid #34c759;
    }

    .insight-negative {
        border-left: 4px solid #ff3b30;
    }

    .insight-text {
        font-size: 14px;
        color: #6e6e73;
        line-height: 1.6;
    }

    .insight-text strong {
        color: #1d1d1f;
    }

    /* DIVIDER */

    .section-divider {
        border: none;
        border-top: 1px solid #e5e5ea;
        margin: 34px 0;
    }

    /* INPUTS */

    .stSelectbox > div > div,
    .stNumberInput > div > div > input {
        background: white !important;
        border: 1px solid #d2d2d7 !important;
        color: #1d1d1f !important;
        border-radius: 14px !important;
    }

    .stSlider > div > div {
        background-color: transparent !important;
    }

    div[data-testid="stForm"] {
        background: transparent !important;
        border: none !important;
    }

    /* BUTTON */

    .stButton > button {
        background: #0071e3 !important;
        color: white !important;
        border: none !important;
        border-radius: 14px !important;
        padding: 14px 24px !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        width: 100% !important;
        transition: all 0.2s ease !important;
    }

    .stButton > button:hover {
        background: #0077ED !important;
        transform: translateY(-1px);
    }

    /* LABELS */

    label {
        color: #6e6e73 !important;
        font-size: 13px !important;
        font-weight: 500 !important;
    }

    .stAlert {
        border-radius: 14px !important;
    }

</style>
""", unsafe_allow_html=True)

# ── Load Models ───────────────────────────────────────────────────────────────
@st.cache_resource
def load_artifacts():
    model     = joblib.load("../models/model.pkl")
    xgb_pipe  = joblib.load("../models/xgb_pipeline.pkl")
    explainer = joblib.load("../models/explainer.pkl")
    return model, xgb_pipe, explainer

try:
    model, xgb_pipeline, explainer = load_artifacts()
    model_loaded = True
except Exception as e:
    model_loaded = False
    st.error(f"Could not load models: {e}")


# ── Hero Section ──────────────────────────────────────────────────────────────
st.markdown("""
<div class="hero-container">
    <div class="hero-badge">⚡ Powered by Stacking Ensemble ML</div>
    <div class="hero-title">AI-Powered<br><span>Loan Intelligence</span></div>
    <div class="hero-subtitle">
        Instantly predict loan approval chances using an ensemble of 
        Logistic Regression, Random Forest & XGBoost — with full AI explainability.
    </div>
    <div class="stats-row">
        <div class="stat-item">
            <div class="stat-number">95.8%</div>
            <div class="stat-label">Model Accuracy</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">0.99</div>
            <div class="stat-label">ROC-AUC Score</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">3</div>
            <div class="stat-label">Ensemble Models</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">SHAP</div>
            <div class="stat-label">Explainability</div>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)


# ── Input Form ────────────────────────────────────────────────────────────────
st.markdown('<p class="section-header">📋 Applicant Information</p>', unsafe_allow_html=True)

with st.form("loan_form"):
    # Row 1 — Personal Info
    st.markdown('<div class="form-card"><div class="form-card-title">👤 Personal Details</div>', unsafe_allow_html=True)
    col1, col2, col3 = st.columns(3)
    with col1:
        age = st.slider("Age", min_value=18, max_value=75, value=30)
    with col2:
        dependents = st.number_input("Dependents", min_value=0, max_value=10, value=0)
    with col3:
        education = st.selectbox("Education Level", ["Graduate", "Not Graduate"])
    st.markdown('</div>', unsafe_allow_html=True)

    # Row 2 — Employment Info
    st.markdown('<div class="form-card"><div class="form-card-title">💼 Employment Details</div>', unsafe_allow_html=True)
    col4, col5, col6 = st.columns(3)
    with col4:
        employment_status = st.selectbox("Employment Status", ["Salaried", "Self-employed", "Contract", "Unemployed"])
    with col5:
        employer_category = st.selectbox("Employer Category", ["Private", "Government", "MNC", "Business", "Unemployed"])
    with col6:
        existing_loans = st.number_input("Existing Loans", min_value=0, max_value=10, value=0)
    st.markdown('</div>', unsafe_allow_html=True)

    # Row 3 — Financial Info
    st.markdown('<div class="form-card"><div class="form-card-title">💰 Financial Details</div>', unsafe_allow_html=True)
    col7, col8, col9 = st.columns(3)
    with col7:
        applicant_income = st.number_input("Applicant Monthly Income (₹)", min_value=0, value=50000, step=1000)
    with col8:
        coapplicant_income = st.number_input("Co-applicant Income (₹)", min_value=0, value=0, step=1000)
    with col9:
        savings = st.number_input("Savings (₹)", min_value=0, value=100000, step=10000)
    st.markdown('</div>', unsafe_allow_html=True)

    # Row 4 — Loan Details
    st.markdown('<div class="form-card"><div class="form-card-title">🏦 Loan Details</div>', unsafe_allow_html=True)
    col10, col11, col12, col13 = st.columns(4)
    with col10:
        loan_amount = st.number_input("Loan Amount (₹)", min_value=0, value=200000, step=10000)
    with col11:
        loan_term = st.number_input("Loan Term (months)", min_value=6, max_value=360, value=120)
    with col12:
        loan_purpose = st.selectbox("Loan Purpose", ["Home", "Education", "Business", "Car", "Personal"])
    with col13:
        property_area = st.selectbox("Property Area", ["Urban", "Semiurban", "Rural"])
    st.markdown('</div>', unsafe_allow_html=True)

    # Row 5 — Assets
    st.markdown('<div class="form-card"><div class="form-card-title">🏠 Assets & Collateral</div>', unsafe_allow_html=True)
    col14, col15 = st.columns(2)
    with col14:
        collateral_value = st.number_input("Collateral Value (₹)", min_value=0, value=500000, step=10000)
    with col15:
        credit_score = st.number_input("Credit Score", min_value=300, max_value=900, value=700)
    st.markdown('</div>', unsafe_allow_html=True)

    submitted = st.form_submit_button("🔍 Predict Loan Approval")


# ── Prediction Logic ──────────────────────────────────────────────────────────
if submitted and model_loaded:

    # Build input dataframe
    input_data = pd.DataFrame({
        "Age":                [age],
        "Dependents":         [dependents],
        "Education_Level":    [education],
        "Employment_Status":  [employment_status],
        "Employer_Category":  [employer_category],
        "Existing_Loans":     [float(existing_loans)],
        "Applicant_Income":   [float(applicant_income)],
        "Coapplicant_Income": [float(coapplicant_income)],
        "Savings":            [float(savings)],
        "Loan_Amount":        [float(loan_amount)],
        "Loan_Term":          [float(loan_term)],
        "Loan_Purpose":       [loan_purpose],
        "Property_Area":      [property_area],
        "Collateral_Value":   [float(collateral_value)],
        "DTI_Ratio_sq":       [float(0)],   # placeholder
        "Credit_Score_sq":    [float(credit_score ** 2)],
    })

    # Compute DTI_Ratio_sq properly
    # DTI = Loan_Amount / Applicant_Income (simplified)
    dti = (loan_amount / applicant_income) if applicant_income > 0 else 0
    input_data["DTI_Ratio_sq"] = dti ** 2

    # Predict
    with st.spinner("🤖 Analysing application..."):
        prediction  = model.predict(input_data)[0]
        probability = model.predict_proba(input_data)[0]
        confidence  = probability[1] if prediction == 1 else probability[0]
        approval_prob = probability[1]

    st.markdown("<hr class='section-divider'>", unsafe_allow_html=True)
    st.markdown('<p class="section-header">🎯 Prediction Result</p>', unsafe_allow_html=True)

    # ── Result Card ──
    col_res, col_conf = st.columns([2, 1])

    with col_res:
        if prediction == 1:
            st.markdown(f"""
            <div class="result-approved">
                <div class="result-icon">✅</div>
                <div class="result-title">Loan Approved</div>
                <div class="result-subtitle">
                    Congratulations! Based on the provided details,<br>
                    this application meets the approval criteria.
                </div>
            </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown(f"""
            <div class="result-rejected">
                <div class="result-icon">❌</div>
                <div class="result-title">Loan Rejected</div>
                <div class="result-subtitle">
                    Based on the provided details, this application<br>
                    does not meet the approval criteria at this time.
                </div>
            </div>
            """, unsafe_allow_html=True)

    with col_conf:
        st.markdown(f"""
        <div class="form-card" style="text-align:center; height:100%;">
            <div class="confidence-label">Approval Probability</div>
            <div class="confidence-value">{approval_prob*100:.1f}%</div>
            <div style="margin-top:16px;">
                <div class="confidence-label">Confidence</div>
                <div style="font-size:24px; font-weight:700; color:#e2e8f0;">
                    {"High ⚡" if confidence > 0.8 else "Medium 🔶" if confidence > 0.6 else "Low 🔴"}
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

    # ── SHAP Explainability ──
    st.markdown("<hr class='section-divider'>", unsafe_allow_html=True)
    st.markdown('<p class="section-header">🧠 AI Explainability (SHAP)</p>', unsafe_allow_html=True)

    try:
        preprocessor   = xgb_pipeline.named_steps["preprocessor"]
        xgb_model      = xgb_pipeline.named_steps["model"]
        feature_names   = preprocessor.get_feature_names_out()
        input_transformed = preprocessor.transform(input_data)

        shap_explainer  = shap.Explainer(xgb_model, input_transformed,
                                          feature_names=feature_names)
        shap_values_out = shap_explainer(input_transformed)

        col_shap1, col_shap2 = st.columns(2)

        with col_shap1:
            st.markdown("**Waterfall Plot** — This specific applicant")
            fig1, ax1 = plt.subplots(figsize=(8, 5))
            fig1.patch.set_facecolor("#1a1f2e")
            shap.plots.waterfall(shap_values_out[0], show=False)
            plt.tight_layout()
            st.pyplot(fig1)
            plt.close()

        with col_shap2:
            st.markdown("**Feature Importance** — Top factors")
            shap_df = pd.DataFrame({
                "Feature": feature_names,
                "SHAP":    np.abs(shap_values_out.values[0])
            }).sort_values("SHAP", ascending=False).head(10)

            fig2, ax2 = plt.subplots(figsize=(8, 5))
            fig2.patch.set_facecolor("#1a1f2e")
            ax2.set_facecolor("#1a1f2e")
            bars = ax2.barh(shap_df["Feature"][::-1],
                            shap_df["SHAP"][::-1],
                            color="#63b3ed", alpha=0.85)
            ax2.tick_params(colors="#a0aec0", labelsize=9)
            ax2.spines[["top","right","left","bottom"]].set_visible(False)
            ax2.set_xlabel("Mean |SHAP value|", color="#718096", fontsize=10)
            ax2.set_title("Top Features Impacting Decision",
                          color="#e2e8f0", fontsize=12, pad=12)
            plt.tight_layout()
            st.pyplot(fig2)
            plt.close()

        # ── AI Insights ──
        st.markdown("<hr class='section-divider'>", unsafe_allow_html=True)
        st.markdown('<p class="section-header">💡 AI Insights</p>', unsafe_allow_html=True)

        shap_raw = shap_values_out.values[0]
        feature_shap = dict(zip(feature_names, shap_raw))
        sorted_shap  = sorted(feature_shap.items(), key=lambda x: abs(x[1]), reverse=True)

        for feat, val in sorted_shap[:5]:
            clean = feat.replace("num__","").replace("ord__","").replace("nom__","").replace("_"," ")
            if val > 0:
                st.markdown(f"""
                <div class="insight-card insight-positive">
                    <span>✅</span>
                    <div class="insight-text">
                        <strong>{clean}</strong> positively influenced the decision 
                        with a SHAP contribution of <strong>+{val:.3f}</strong>.
                    </div>
                </div>""", unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div class="insight-card insight-negative">
                    <span>⚠️</span>
                    <div class="insight-text">
                        <strong>{clean}</strong> negatively influenced the decision 
                        with a SHAP contribution of <strong>{val:.3f}</strong>.
                    </div>
                </div>""", unsafe_allow_html=True)

    except Exception as e:
        st.warning(f"SHAP explanation unavailable: {e}")


# ── Footer ────────────────────────────────────────────────────────────────────
st.markdown("<hr class='section-divider'>", unsafe_allow_html=True)
st.markdown("""
<div style="text-align:center; color:#4a5568; font-size:13px; padding:16px 0 32px;">
    <strong style="color:#718096;">CreditWise</strong> · Built with Stacking Ensemble ML + SHAP Explainability<br>
    <span style="font-size:12px;">For educational purposes only. Not financial advice.</span>
</div>
""", unsafe_allow_html=True)