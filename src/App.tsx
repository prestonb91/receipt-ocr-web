import { useState } from 'react';

function App() {

  const [photo, setPhoto] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("Extracted Text Appears Here");

  const API_KEY = import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY;

  // Open the camera after asking for permission.
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhoto(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Have google OCR analyze photo and store parsed data.
  const performOCR = async () => {

    if (!photo) {
      alert("No Image: Please capture or select an image first.");
      return;
    }

    try {

      // Remove metadata from base64
      const base64Image = photo.toString().split(",")[1];

      const body = JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: { type: "TEXT_DETECTION" },
          },
        ],
      });

        // Send request to Google Vision API
        const visionURL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;
        const res = await fetch(visionURL, {
          method: "POST",
          body,
          headers: { "Content-Type": "application/json" },
        });

        const result = await res.json();
        const text = result.responses?.[0]?.fullTextAnnotation?.text || "No text found";

        setExtractedText(text);
        console.log("Extracted text", text);

      } catch (error) {
        console.error("OCR Error:", error);
        console.error("OCR Error: Failed to analyze receipt.");
      }
    }


  return (
    <>
      <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="flex justify center items-center pl-20 h-1/4">
            <h1 className="text-7xl font-bold text-center">Receipt<br /> Reader</h1>
          </div>

          {/* Body */}
          <div className="flex flex-row flex-grow items-center justify-evenly">
            
            {/* File Upload */}
            <div className="flex flex-col w-96">
              <label
                htmlFor="file-upload"
                className="bg-gray-200 p-2 m-5 rounded hover:bg-gray-300 transition transform active:scale-95 text-center"
              >
                Upload Receipt
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {photo && (
                <div className="mt-1">
                  <img 
                    src={photo} 
                    alt="Selected"
                    className="border-4 border-gray-300 rounded p-2 h-96 object-contain" 
                  />
                </div>
              )}

              <button 
                onClick={performOCR} 
                className="bg-gray-200 p-2 m-5 rounded hover:bg-gray-300 transition transform active:scale-95"
              >
                Analyze Receipt
              </button>
            </div>

            {/* Text Extract */}
            <div
              className="border-4 border-gray-300 rounded p-2 w-96 h-96 flex justify-center items-center" 
            >
              {extractedText && (
                <span>{extractedText}</span>
              )}
            </div>
        </div>
      </div>
    </>
  );

}

export default App