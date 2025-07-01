import React, { useEffect, useRef } from 'react';

// تحميل مكتبة model-viewer من جوجل (مفتوحة المصدر)
const ensureModelViewer = () => {
  if (!document.querySelector('script[src*="model-viewer.min.js"]')) {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    document.head.appendChild(script);
  }
};

interface ModelViewerProps {
  src: string;
  style?: React.CSSProperties;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ src, style }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ensureModelViewer();
  }, []);
  return (
    <div ref={ref} style={style}>
      {/* @ts-ignore */}
      <model-viewer src={src} ar auto-rotate camera-controls style={{width:'100%',height:'100%',background:'#222',borderRadius:12}}></model-viewer>
    </div>
  );
};

export default ModelViewer;
