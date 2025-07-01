// خدمة الذكاء الاصطناعي للبحث والتوصيات العقارية
export function smartSearch(query: string, properties: any[]) {
  // بحث ذكي: يطابق العنوان، التفاصيل، الموقع، المطور، الكمباوند، النوع
  const q = query.toLowerCase();
  return properties.filter(p =>
    p.title?.toLowerCase().includes(q) ||
    p.details?.toLowerCase().includes(q) ||
    p.location?.toLowerCase().includes(q) ||
    p.developer?.toLowerCase().includes(q) ||
    p.compound?.toLowerCase().includes(q) ||
    p.type?.toLowerCase().includes(q)
  );
}
// يمكن تطويرها لاحقاً لاقتراح وحدات بناءً على سلوك المستخدم
