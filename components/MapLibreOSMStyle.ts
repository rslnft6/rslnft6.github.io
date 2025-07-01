// إعداد ستايل OpenStreetMap متوافق مع maplibre-gl (TypeScript)
import type { StyleSpecification } from 'maplibre-gl';

const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors'
    } as any // تجاوز النوعية لأن maplibre-gl يطلب type: 'raster' فقط
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm'
    }
  ]
};

export default OSM_STYLE;
