# Model metadata (from models/metadata.pkl)

## Version
- `creditwise-realistic-v1`

## Monthly interest rate
- `0.008333...` (10% annual / 12) — used as training/inference EMI convention

## Feature columns (16)
1. Applicant_Income
2. Coapplicant_Income
3. Employment_Status
4. Age
5. Dependents
6. Existing_Loans
7. Savings
8. Collateral_Value
9. Loan_Amount
10. Loan_Term
11. Loan_Purpose
12. Property_Area
13. Education_Level
14. Employer_Category
15. DTI_Ratio_sq
16. Credit_Score_sq

## Model type (model.pkl)
- sklearn `Pipeline`: ColumnTransformer preprocessor → `StackingClassifier`
- Base estimators: LogisticRegression, RandomForestClassifier, XGBClassifier
- Meta learner: LogisticRegression (`stack_method=predict_proba`, `cv=5`)
- Classes: `0` = Rejected, `1` = Approved

## Related artifacts (not used by the live API)
- `xgb_pipeline.pkl` — alternate notebook pipeline
- `explainer.pkl` — SHAP TreeExplainer from notebook experiments

## Evaluation metrics
See README “Model comparison” for notebook hold-out and CV metrics.
Do not invent production metrics beyond what the training/evaluation pipeline produced.
