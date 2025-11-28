import React, { useState, useRef } from 'react';
import { Upload, ArrowRight, Activity, Image as ImageIcon, Download, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('demo'); // 'demo' or 'real'

  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setProcessedImage(null);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setProcessedImage(null);
      setError(null);
    }
  };

  // --- SIMULATION MODE ---
  // This simulates what happens when you hit the Python API
  const processImageMock = () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    
    // Simulate network delay
    setTimeout(() => {
      // In a real app, this URL would come from the backend response
      // Here we just use the same image but will apply a CSS filter to it in the view
      setProcessedImage(selectedImage); 
      setIsProcessing(false);
    }, 2000);
  };

  // --- REAL MODE (Reference Code) ---
  // This is the function you would use with the Python `app.py`
  const processImageReal = async () => {
    if (!fileInputRef.current?.files?.[0]) return;

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', fileInputRef.current.files[0]);

    try {
      // Assuming Flask is running on localhost:5000
      const response = await fetch('http://localhost:5000/process-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to process image');

      // Convert response blob to an image URL
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setProcessedImage(imageUrl);
    } catch (err) {
      setError("Could not connect to Backend. Ensure app.py is running!");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setProcessedImage(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              NeuroVision
            </h1>
          </div>
          <div className="text-sm font-medium text-slate-500">
            ML Inference Interface
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Intro */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Image Transformation Model
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Upload an image to pass it through the neural network. 
            The backend will process the inputs and return the inference result.
          </p>
          
          {/* Mode Switcher for Educational Purpose */}
          <div className="mt-6 inline-flex bg-slate-200 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('demo')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'demo' 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Frontend Demo (Simulation)
            </button>
            <button
              onClick={() => setActiveTab('real')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'real' 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Real API Mode
            </button>
          </div>
          {activeTab === 'real' && (
            <div className="mt-3 text-xs text-amber-600 bg-amber-50 inline-block px-3 py-1 rounded-full border border-amber-100">
              ⚠ Requires local Python backend running on port 5000
            </div>
          )}
        </div>

        {/* Main Work Area */}
        <div className="grid lg:grid-cols-[1fr,auto,1fr] gap-8 items-start">
          
          {/* 1. Input Section */}
          <div className="flex flex-col gap-4">
            <div className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs">1</span>
              Input Image
            </div>
            
            <div 
              className={`
                relative h-80 rounded-2xl border-2 border-dashed transition-all overflow-hidden bg-white
                ${selectedImage ? 'border-indigo-200' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
              `}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {selectedImage ? (
                <div className="relative w-full h-full group">
                  <img 
                    src={selectedImage} 
                    alt="Input" 
                    className="w-full h-full object-contain p-4" 
                  />
                  <button 
                    onClick={reset}
                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur shadow-sm rounded-full text-slate-600 hover:text-red-500 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full mb-4">
                    <Upload className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Click to upload</span>
                  <span className="text-xs text-slate-400 mt-1">or drag and drop</span>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                </label>
              )}
            </div>
          </div>

          {/* 2. Processing Action */}
          <div className="flex flex-col items-center justify-center lg:pt-32 gap-4">
            <button
              onClick={activeTab === 'demo' ? processImageMock : processImageReal}
              disabled={!selectedImage || isProcessing}
              className={`
                group relative px-6 py-3 rounded-full font-semibold text-white shadow-lg shadow-indigo-200 transition-all
                ${!selectedImage || isProcessing 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95'
                }
              `}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Activity className="w-5 h-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Run Model
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
            
            {error && (
              <div className="absolute top-full mt-4 w-48 p-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* 3. Output Section */}
          <div className="flex flex-col gap-4">
            <div className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs">2</span>
              Output Result
            </div>
            
            <div className="relative h-80 rounded-2xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
              {processedImage ? (
                <div className="relative w-full h-full animate-in fade-in duration-700">
                  <img 
                    src={processedImage} 
                    alt="Processed" 
                    className={`
                      w-full h-full object-contain p-4 transition-all duration-1000
                      ${activeTab === 'demo' ? 'grayscale contrast-125' : ''} 
                    `}
                    // Note: In demo mode, we use CSS filters to simulate the ML effect
                    // In real mode, the image itself comes back processed from Python
                  />
                  <a 
                    href={processedImage} 
                    download="processed_image.jpg"
                    className="absolute bottom-4 right-4 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                    title="Download Result"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              ) : (
                <div className="text-center p-8">
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                      <span className="text-sm text-slate-500 animate-pulse">Running inference...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <ImageIcon className="w-12 h-12 opacity-50" />
                      <span className="text-sm">Result will appear here</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-16 border-t border-slate-200 pt-8 grid md:grid-cols-3 gap-8 text-sm text-slate-600">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Frontend Stack</h4>
            <ul className="space-y-1">
              <li>• React.js</li>
              <li>• Tailwind CSS</li>
              <li>• Lucide Icons</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Backend Stack</h4>
            <ul className="space-y-1">
              <li>• Python 3.9+</li>
              <li>• Flask (API)</li>
              <li>• PyTorch / TensorFlow (ML)</li>
              <li>• Pillow (Image Processing)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Deployment</h4>
            <p className="mb-2">For real deployment, containerize the Python backend with Docker and host on AWS, Google Cloud Run, or Heroku.</p>
          </div>
        </div>
      </main>
    </div>
  );
}