import sys
import joblib
import numpy as np
import os

try:
    type = int(sys.argv[1])
    length = float(sys.argv[2])
    weight = float(sys.argv[3])
    distance = float(sys.argv[4])

    script_dir = os.path.dirname(__file__)
    model_path = os.path.join(script_dir, 'model.pkl')
    model = joblib.load(model_path)

    input_data = np.array([[type, length, weight, distance]])
    predicted_price = model.predict(input_data)[0]
    print(predicted_price)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
