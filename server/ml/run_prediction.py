import sys
import joblib
import numpy as np

type = int(sys.argv[1])
length = float(sys.argv[2])
weight = float(sys.argv[3])
distance = float(sys.argv[4])

model = joblib.load('server/ml/model.pkl')
input_data = np.array([[type, length, weight, distance]])
predicted_price = model.predict(input_data)[0]
print(predicted_price)
