# train_model.py
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

# Example data (replace with real order data)
data = pd.DataFrame([
    {'type': 0, 'length': 10, 'weight': 5, 'distance': 3, 'price': 50},
    {'type': 1, 'length': 30, 'weight': 15, 'distance': 8, 'price': 100},
    {'type': 0, 'length': 5,  'weight': 2, 'distance': 1, 'price': 30},
    # Add more real examples here
])

X = data[['type', 'length', 'weight', 'distance']]
y = data['price']

model = RandomForestRegressor()
model.fit(X, y)

joblib.dump(model, 'server/ml/model.pkl')
print("✅ Model trained and saved to server/ml/model.pkl")
