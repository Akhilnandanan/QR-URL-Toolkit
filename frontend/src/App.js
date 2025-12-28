import React, { useState } from 'react';
import './App.css';

function App() {
  // QR Code State
  const [qrText, setQrText] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [qrLoading, setQrLoading] = useState(false);

  // URL Shortener State
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);

  // Generate QR Code
  const handleGenerateQR = async () => {
    if (!qrText.trim()) {
      alert('Please enter text for QR code');
      return;
    }

    setQrLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/generate-qr/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: qrText }),
      });

      const data = await response.json();
      if (data.success) {
        setQrCode(data.qr_code);
      } else {
        alert('Error generating QR code');
      }
    } catch (error) {
      alert('Error connecting to server');
    } finally {
      setQrLoading(false);
    }
  };
// Shorten URL
const handleShortenUrl = async () => {
  if (!originalUrl.trim()) {
    alert('Please enter a URL to shorten');
    return;
  }

  // Validate URL format
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  if (!urlPattern.test(originalUrl)) {
    alert('Please enter a valid URL (e.g., https://example.com)');
    return;
  }

  // Add https:// if missing
  let validUrl = originalUrl;
  if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
    validUrl = 'https://' + originalUrl;
  }

  setUrlLoading(true);
  try {
    const response = await fetch('http://127.0.0.1:8000/api/shorten/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: validUrl }),
    });

    const data = await response.json();
    if (data.success) {
      setShortUrl(data.short_url);
    } else {
      alert('Error shortening URL');
    }
  } catch (error) {
    alert('Error connecting to server');
  } finally {
    setUrlLoading(false);
  }
};
  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Download QR Code
  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'qrcode.png';
    link.click();
  };

  return (
    <div className="App">
      {/* Navbar */}
      <nav className="navbar">
        <h1>LinkSnap</h1>
      </nav>

      {/* Main Content */}
      <div className="container">
        {/* QR Code Generator Card */}
        <div className="card">
          <h2>QR Code Generator</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter text or URL"
              value={qrText}
              onChange={(e) => setQrText(e.target.value)}
            />
            <button onClick={handleGenerateQR} disabled={qrLoading}>
              {qrLoading ? 'Generating...' : 'Generate QR'}
            </button>
          </div>

          {qrCode && (
            <div className="result">
              <img src={qrCode} alt="QR Code" className="qr-image" />
              <button onClick={downloadQR} className="download-btn">
                Download QR Code
              </button>
            </div>
          )}
        </div>

        {/* URL Shortener Card */}
        <div className="card">
          <h2>URL Shortener</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter URL to shorten"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
            />
            <button onClick={handleShortenUrl} disabled={urlLoading}>
              {urlLoading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </div>

          {shortUrl && (
            <div className="result">
              <div className="short-url-display">
                <input type="text" value={shortUrl} readOnly />
                <button onClick={() => copyToClipboard(shortUrl)}>
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;