import sys
import joblib
import os
import pandas as pd

try:
    type = int(sys.argv[1])
    length = float(sys.argv[2])
    weight = float(sys.argv[3])
    distance = float(sys.argv[4])

    script_dir = os.path.dirname(__file__)
    model_path = os.path.join(script_dir, 'model.pkl')
    model = joblib.load(model_path)

    input_data = pd.DataFrame([{
        'type': type,
        'length': length,
        'weight': weight,
        'distance': distance
    }])

    predicted_price = model.predict(input_data)[0]
    print(predicted_price)

except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
