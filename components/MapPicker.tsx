import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import OSM_STYLE from './MapLibreOSMStyle';

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  height?: number | string;
}

const MapPicker: React.FC<MapPickerProps> = ({ lat, lng, onChange, height = 320 }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // تهيئة الخريطة مرة واحدة فقط
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: OSM_STYLE,
      center: [lng, lat],
      zoom: 12,
    });
    mapRef.current = map;
    const marker = new maplibregl.Marker({ draggable: true })
      .setLngLat([lng, lat])
      .addTo(map);
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLngLat();
      onChange(lat, lng);
    });
    markerRef.current = marker;
    map.on('click', (e) => {
      marker.setLngLat(e.lngLat);
      onChange(e.lngLat.lat, e.lngLat.lng);
    });
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // تحديث marker فقط عند تغيير الإحداثيات
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    }
    if (mapRef.current) {
      mapRef.current.setCenter([lng, lat]);
    }
  }, [lat, lng]);

  return <div ref={mapContainer} style={{ width: '100%', height, borderRadius: 12, margin: '12px 0', boxShadow: '0 2px 12px #e0e0e0' }} />;
};

export default MapPicker;
