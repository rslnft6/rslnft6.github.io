import React, { useState } from 'react';

const VoiceSearch: React.FC<{ onResult: (text: string) => void }> = ({ onResult }) => {
  const [listening, setListening] = useState(false);
  let recognition: any;
  if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
    recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'ar-EG';
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
  }
  const start = () => {
    setListening(true);
    recognition && recognition.start();
  };
  return (
    <button onClick={start} style={{background:'#00bcd4',color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',marginRight:8}}>
      🎤 {listening ? 'يستمع...' : 'بحث صوتي'}
    </button>
  );
};
export default VoiceSearch;
