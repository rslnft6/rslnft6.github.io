import { propertyImages } from '../data/backgrounds';

// صور رمزية افتراضية للوحدات (قصور، فيلات، شقق، عيادات، محلات، مكاتب)
// export const propertyImages = {
//   palace: '/images/palace.jpg',
//   villa: '/images/villa.jpg',
//   apartment: '/images/apartment.jpg',
//   clinic: '/images/clinic.jpg',
//   shop: '/images/shop.jpg',
//   office: '/images/office.jpg',
// };

// توليد بيانات ضخمة للوحدات (50 قصر، 50 فيلا، 50 شقة، 50 عيادة، 50 محل، 50 مكتب)
function generateProperties() {
  const types = [
    { type: 'palace', title: 'قصر', img: propertyImages.palace },
    { type: 'villa', title: 'فيلا', img: propertyImages.villa },
    { type: 'apartment', title: 'شقة', img: propertyImages.apartment },
    { type: 'clinic', title: 'عيادة', img: propertyImages.clinic },
    { type: 'shop', title: 'محل', img: propertyImages.shop },
    { type: 'office', title: 'مكتب', img: propertyImages.office },
    { type: 'penthouse', title: 'بنتهاوس', img: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&w=1200&q=80', panorama360: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&w=1200&q=80'] },
    { type: 'townhouse', title: 'تاون هاوس', img: 'https://images.pexels.com/photos/261146/pexels-photo-261146.jpeg?auto=compress&w=1200&q=80', panorama360: ['https://images.pexels.com/photos/261146/pexels-photo-261146.jpeg?auto=compress&w=1200&q=80'] },
  ];
  const countries = [
    { name: 'مصر', city: 'القاهرة', lng: 31.2357, lat: 30.0444 },
    { name: 'الإمارات', city: 'دبي', lng: 55.2708, lat: 25.2048 },
    { name: 'السعودية', city: 'الرياض', lng: 46.6753, lat: 24.7136 },
    { name: 'الكويت', city: 'مدينة الكويت', lng: 47.9783, lat: 29.3759 },
    { name: 'البحرين', city: 'المنامة', lng: 50.5832, lat: 26.2235 },
    { name: 'قطر', city: 'الدوحة', lng: 51.5310, lat: 25.2854 },
    { name: 'عمان', city: 'مسقط', lng: 58.3829, lat: 23.5880 },
    { name: 'الأردن', city: 'عمّان', lng: 35.9106, lat: 31.9632 },
    { name: 'الجزائر', city: 'الجزائر العاصمة', lng: 3.0588, lat: 36.7538 },
    { name: 'المغرب', city: 'الدار البيضاء', lng: -7.5898, lat: 33.5731 },
  ];
  const compounds = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `كمبوند ${i + 1}` }));
  const developers = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `مطور ${i + 1}` }));
  const arr: any[] = [];
  let id = 1;
  types.forEach((t) => {
    for (let i = 0; i < 50; i++) {
      const country = countries[i % countries.length];
      arr.push({
        id: id++,
        title: `${t.title} ${i + 1} في ${country.city}`,
        type: t.type,
        location: `${country.name} - ${country.city}`,
        status: i % 7 === 0 ? 'مباع' : 'متاح',
        image: t.img,
        details: `${t.title} بمواصفات عالمية، رقم الوحدة ${i + 1}.`,
        lng: country.lng,
        lat: country.lat,
        panorama360: t.panorama360 || [
          // صور بانوراما 360 مجانية لكل نوع عقار
          t.type === 'palace' ? 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&w=1200&q=80' :
          t.type === 'villa' ? 'https://images.pexels.com/photos/261146/pexels-photo-261146.jpeg?auto=compress&w=1200&q=80' :
          t.type === 'apartment' ? 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&w=1200&q=80' :
          t.type === 'clinic' ? 'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&w=1200&q=80' :
          t.type === 'shop' ? 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&w=1200&q=80' :
          t.type === 'office' ? 'https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg?auto=compress&w=1200&q=80' :
          t.type === 'penthouse' ? 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&w=1200&q=80' :
          t.type === 'townhouse' ? 'https://images.pexels.com/photos/261146/pexels-photo-261146.jpeg?auto=compress&w=1200&q=80' :
          '',
        ],
        model3d: t.type === 'palace' ? 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' :
          t.type === 'villa' ? 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb' :
          t.type === 'apartment' ? 'https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb' :
          t.type === 'clinic' ? 'https://modelviewer.dev/shared-assets/models/Car.glb' :
          t.type === 'shop' ? 'https://modelviewer.dev/shared-assets/models/Chair.glb' :
          t.type === 'office' ? 'https://modelviewer.dev/shared-assets/models/MaterialGallery.glb' :
          t.type === 'penthouse' ? 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' :
          t.type === 'townhouse' ? 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb' :
          '',
        compound: compounds[i % compounds.length]?.name || '',
        developer: developers[i % developers.length]?.name || '',
      });
    }
  });
  return arr;
}

// لا تعيد تصدير properties مرتين، فقط استخدم getAllProperties في كل مكان في التطبيق
// export const properties = generateProperties();

// إضافة وحدات ومشاريع وكمباوندات افتراضية جديدة
export function getAllProperties() {
  const extraProperties = [
    {
      id: 1001,
      title: 'قصر فاخر في القاهرة الجديدة',
      type: 'palace',
      developer: 'سوديك',
      compound: 'سوديك ويست',
      country: 'مصر',
      location: 'القاهرة الجديدة',
      area: 1200,
      rooms: 8,
      baths: 7,
      lng: 31.5,
      lat: 30.1,
      model3d: '/models/palace.glb',
      panorama360: ['/images/palace.jpg'],
      details: 'قصر فخم مع مسبح وحديقة كبيرة، تشطيب سوبر لوكس.'
    },
    {
      id: 1002,
      title: 'شقة ذكية في دبي مارينا',
      type: 'apartment',
      developer: 'إعمار الإمارات',
      compound: 'ميفيدا إعمار',
      country: 'الإمارات',
      location: 'دبي مارينا',
      area: 180,
      rooms: 3,
      baths: 2,
      lng: 55.13,
      lat: 25.08,
      model3d: '/models/apartment.glb',
      panorama360: ['/images/apartment.jpg'],
      details: 'شقة ذكية بإطلالة بحرية، مفروشة بالكامل، مع موقف خاص.'
    },
    {
      id: 1003,
      title: 'فيلا عائلية في الرياض',
      type: 'villa',
      developer: 'الدار العقارية',
      compound: 'هايد بارك',
      country: 'السعودية',
      location: 'الرياض',
      area: 350,
      rooms: 5,
      baths: 4,
      lng: 46.7,
      lat: 24.7,
      model3d: '/models/villa.glb',
      panorama360: ['/images/villa.jpg'],
      details: 'فيلا عائلية مع جاردن ومسبح، قريبة من جميع الخدمات.'
    },
    // ...يمكنك إضافة المزيد لاحقًا...
  ];
  return [...generateProperties(), ...extraProperties];
}

// توليد بيانات ضخمة للمشروعات (50 مشروع)
export const projects = Array.from({ length: 50 }).map((_, i) => {
  const countries = [
    { name: 'مصر', city: 'القاهرة' },
    { name: 'الإمارات', city: 'دبي' },
    { name: 'السعودية', city: 'الرياض' },
    { name: 'الكويت', city: 'مدينة الكويت' },
    { name: 'البحرين', city: 'المنامة' },
    { name: 'قطر', city: 'الدوحة' },
    { name: 'عمان', city: 'مسقط' },
    { name: 'الأردن', city: 'عمّان' },
    { name: 'الجزائر', city: 'الجزائر العاصمة' },
    { name: 'المغرب', city: 'الدار البيضاء' },
  ];
  const country = countries[i % countries.length];
  return {
    id: i + 1,
    name: `مشروع ${i + 1} في ${country.city}`,
    country: country.name,
    status: i % 3 === 0 ? 'انتهى الطرح' : 'تحت التنفيذ',
    image: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=600&q=80',
    details: `مشروع عقاري مميز رقم ${i + 1} في ${country.city}.`
  };
});
