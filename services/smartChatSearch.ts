// دالة بحث بسيطة عن العقارات بناءً على الكلمات المفتاحية في السؤال
import { getAllProperties } from '../data/properties';

export function searchPropertiesInText(text: string) {
  const properties = getAllProperties();
  // استخراج كلمات مفتاحية محتملة
  const keywords = text.split(/[\s,،.]+/).filter(Boolean);
  // بحث بسيط: إذا وُجد اسم مدينة أو نوع عقار في العنوان أو الموقع
  const results = properties.filter((p) => {
    return keywords.some(
      (k) =>
        (p.title && p.title.includes(k)) ||
        (p.location && p.location.includes(k)) ||
        (p.details && p.details.includes(k))
    );
  });
  return results.slice(0, 5); // نعيد فقط أول 5 نتائج
}
