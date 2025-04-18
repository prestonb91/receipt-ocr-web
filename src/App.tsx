import { useState } from 'react';

function App() {

  const [photo, setPhoto] = useState<any>(null);
  const [extractedText, setExtractedText] = useState<any>("");

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
    <div className="app">
      <h1>Receipt OCR</h1>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      {photo && (
        <div style={{ marginTop: '1rem' }}>
          <img src={photo} alt="Selected" style={{ width: 200, height: 200 }} />
        </div>
      )}

      <button onClick={performOCR} style={{ marginTop: '1rem' }}>
        Analyze Receipt
      </button>

      {extractedText && (
        <pre style={{ background: '#fff', padding: '1rem', marginTop: '1rem' }}>
          {extractedText}
        </pre>
      )}
    </div>
    </>
  );

}

export default App