import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image, ImageOps
import io

# Initialize Flask App
app = Flask(__name__)
# Enable CORS so the frontend can talk to this backend
CORS(app)

def run_ml_model(image):
    """
    Placeholder for your actual ML model.
    Currently, this just converts the image to Grayscale 
    to simulate "processing".
    """
    # --- YOUR ML CODE GOES HERE ---
    # Example: prediction = model.predict(image)
    
    # For demo: specific "edge detection" or grayscale
    processed_image = ImageOps.grayscale(image)
    return processed_image

@app.route('/process-image', methods=['POST'])
def process_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    
    # 1. Read the image
    image = Image.open(file.stream)
    
    # 2. Run the Model
    result_image = run_ml_model(image)
    
    # 3. Save result to a memory buffer to send back
    img_io = io.BytesIO()
    result_image.save(img_io, 'JPEG')
    img_io.seek(0)
    
    # 4. Return the image to the frontend
    return send_file(img_io, mimetype='image/jpeg')

if __name__ == '__main__':
    print("Starting Flask Server...")
    # Run on http://localhost:5000
    app.run(debug=True, port=5000)