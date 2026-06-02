from flask import Flask, request, jsonify
from flask_cors import CORS
from model import predict, train
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/ml/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'placement-predictor'})

@app.route('/api/ml/predict', methods=['POST'])
def predict_placement():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON body'}), 400
        result = predict(data)
        return jsonify(result)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/api/ml/retrain', methods=['POST'])
def retrain():
    try:
        result = train()
        return jsonify({'status': 'ok', 'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print('Training placement prediction model...')
    result = train()
    print(f'Model trained: accuracy={result["accuracy"]:.3f}, r2={result["r2"]:.3f}')
    app.run(host='0.0.0.0', port=port, debug=False)
