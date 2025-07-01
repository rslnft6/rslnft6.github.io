import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import OSM_STYLE from './MapLibreOSMStyle';

interface MapViewProps {
  properties: any[];
  compounds?: any[];
  onCompoundClick?: (compoundName: string) => void;
  onDeveloperClick?: (developerName: string) => void;
}

const MapView: React.FC<MapViewProps> = ({ properties, compounds = [], onCompoundClick, onDeveloperClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);

  const mapRef = useRef<maplibregl.Map | null>(null);
  // لتخزين كل العلامات حتى يمكن حذفها عند التحديث
  const markersRef = useRef<any[]>([]);

  // إنشاء الخريطة مرة واحدة فقط
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: OSM_STYLE,
      center: [31.2357, 30.0444],
      zoom: 5
    });
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // تحديث العلامات عند تغيير البيانات
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // حذف كل العلامات القديمة
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // عرض الوحدات
    properties.forEach((p: any) => {
      if (p.lng && p.lat) {
        const iconUrl =
          p.type === 'palace' ? '/images/palace.jpg' :
          p.type === 'villa' ? '/images/villa.jpg' :
          p.type === 'apartment' ? '/images/apartment.jpg' :
          p.type === 'clinic' ? '/images/clinic.jpg' :
          p.type === 'shop' ? '/images/shop.jpg' :
          p.type === 'office' ? '/images/office.jpg' :
          '/images/logo1.png';
        const el = document.createElement('div');
        el.style.width = '44px';
        el.style.height = '44px';
        el.style.borderRadius = '50%';
        el.style.overflow = 'hidden';
        el.style.boxShadow = '0 2px 8px #888';
        el.style.border = '2px solid #00bcd4';
        el.style.background = '#fff';
        el.style.cursor = 'pointer';
        el.title = p.title;
        const img = document.createElement('img');
        img.src = iconUrl;
        img.alt = p.title;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
        el.appendChild(img);
        el.onclick = (e) => {
          e.stopPropagation();
          if (onCompoundClick && p.compound) {
            onCompoundClick(p.compound);
            return;
          }
          if (onDeveloperClick && p.developer) {
            onDeveloperClick(p.developer);
            return;
          }
          const popup = new maplibregl.Popup({ offset: 18 })
            .setLngLat([p.lng, p.lat])
            .setHTML(`
              <div style='min-width:220px;max-width:260px;text-align:right'>
                <img src='${p.image || iconUrl}' alt='${p.title}' style='width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px' />
                <div style='font-weight:bold;color:#00bcd4;font-size:18px;margin-bottom:4px'>${p.title}</div>
                <div style='color:#ff9800;font-size:15px;margin-bottom:4px'>${p.location || ''}</div>
                <div style='color:#2196f3;font-size:15px;margin-bottom:4px;font-weight:bold'>${p.compound ? '🏢 ' + p.compound : ''}</div>
                <button style='background:#2196f3;color:#fff;border:none;border-radius:8px;padding:6px 18px;font-weight:bold;cursor:pointer;margin-top:8px' onclick="window.location.href='/property/${p.id}'">تفاصيل الوحدة</button>
              </div>
            `)
            .addTo(map);
        };
        const marker = new maplibregl.Marker(el).setLngLat([p.lng, p.lat]).addTo(map);
        markersRef.current.push(marker);
      }
    });

    // عرض الكمباوندات بلون مختلف حسب الدولة
    compounds.forEach((c: any) => {
      if (c.city && c.country) {
        const unit = properties.find((p: any) => p.compound === c.name && p.lng && p.lat);
        if (!unit) return;
        // تحديد اللون حسب الدولة
        let borderColor = '#8e24aa'; // بنفسجي افتراضي
        let boxShadow = '0 2px 16px #8e24aa55';
        if (c.country === 'مصر') {
          borderColor = '#43a047'; // أخضر
          boxShadow = '0 2px 16px #43a04788';
        }
        const el = document.createElement('div');
        el.style.width = '54px';
        el.style.height = '54px';
        el.style.borderRadius = '50%';
        el.style.overflow = 'hidden';
        el.style.boxShadow = boxShadow;
        el.style.border = `3px solid ${borderColor}`;
        el.style.background = 'rgba(255,255,255,0.95)';
        el.style.cursor = 'pointer';
        el.title = c.name;
        const img = document.createElement('img');
        img.src = c.logo || '/globe.svg';
        img.alt = c.name;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
        el.appendChild(img);
        el.onclick = (e) => {
          e.stopPropagation();
          if (onCompoundClick) {
            onCompoundClick(c.name);
            return;
          }
          // جلب كل الوحدات داخل هذا الكمباوند
          const units = properties.filter((p: any) => p.compound === c.name);
          const html = `<div style='min-width:220px;max-width:280px;text-align:right'>
            <div style='font-weight:bold;color:${borderColor};font-size:22px;margin-bottom:8px'>${c.name}</div>
            <div style='color:#00bcd4;font-size:15px;margin-bottom:8px'>${c.city || ''} - ${c.country || ''}</div>
            <div style='font-size:15px;font-weight:bold;margin-bottom:8px'>الوحدات المتاحة:</div>
            <ul style='padding:0;margin:0;list-style:none;'>
              ${units.map(u => `<li style='margin-bottom:6px;'><a href='/property/${u.id}' style='color:#00bcd4;text-decoration:underline;font-weight:bold;cursor:pointer;'>${u.title || 'وحدة'}</a></li>`).join('')}
            </ul>
          </div>`;
          new maplibregl.Popup({ offset: 18 })
            .setLngLat([unit.lng, unit.lat])
            .setHTML(html)
            .addTo(map);
        };
        const marker = new maplibregl.Marker(el).setLngLat([unit.lng, unit.lat]).addTo(map);
        markersRef.current.push(marker);
      }
    });
  }, [properties, compounds]);

  return <div ref={mapContainer} style={{width:'100%',height:400,borderRadius:16,margin:'32px 0',boxShadow:'0 2px 16px #e0e0e0'}} />;
};

export default MapView;
