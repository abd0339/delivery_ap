# train_model.py
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

# Example data (replace with real order data)
data = pd.read_csv('server/delivery_pricing_dataset.csv')

X = data[['type', 'length', 'weight', 'distance']]
y = data['price']

model = RandomForestRegressor()
model.fit(X, y)

joblib.dump(model, 'server/ml/model.pkl')
print("✅ Model trained and saved to server/ml/model.pkl")
