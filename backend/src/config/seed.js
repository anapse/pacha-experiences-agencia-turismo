const { initDatabase, getDatabase } = require('./database');
const { hashPassword } = require('../utils/password');

// Inicializar DB antes de seed
initDatabase();

async function seed() {
  const db = getDatabase();

  console.log('🌱 Sembrando datos iniciales...');

  // Admin por defecto
  const adminPassword = await hashPassword('admin123');
  const admin = db.prepare(
    'INSERT OR IGNORE INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)'
  ).run('Admin Pacha', 'admin@pacha.com', adminPassword, '999000000', 'admin');

  if (admin.changes > 0) {
    db.prepare('INSERT OR IGNORE INTO clients (user_id) VALUES (?)').run(admin.lastInsertRowid);
    console.log('  ✓ Admin creado: admin@pacha.com / admin123');
  } else {
    console.log('  - Admin ya existe');
  }

  // Experiencias
  const experiences = [
    {
      name: 'Tubulares en Huacachina',
      slug: 'tubulares-huacachina',
      description: 'La experiencia definitiva en Huacachina. Disfruta de un emocionante paseo en tubulares por las dunas más altas de Sudamérica mientras el sol se pone sobre el desierto.',
      short_description: 'Emocionante paseo en tubulares por las dunas de Huacachina al atardecer.',
      duration: '3 horas',
      base_price: 50,
      min_capacity: 2,
      max_capacity: 20,
      category: 'tubular',
      includes: JSON.stringify(['Transporte Plaza de Armas → Tierra Prometida', 'Tubulares (30 min)', 'Guía profesional', 'Agua', 'Seguro básico']),
      requirements: JSON.stringify(['Ropa cómoda', 'Zapatos cerrados', 'Bloqueador solar', 'Lentes de sol']),
      restrictions: JSON.stringify(['No recomendado para mujeres embarazadas', 'No recomendado para personas con problemas de espalda']),
      itinerary: JSON.stringify([
        { time: '15:00', description: 'Salida desde Plaza de Armas' },
        { time: '15:30', description: 'Llegada a Tierra Prometida' },
        { time: '15:45', description: 'Inicio de tubulares' },
        { time: '16:45', description: 'Fotografías en dunas' },
        { time: '17:15', description: 'Regreso a Huacachina' }
      ]),
      image_placeholder: 'IMG_HERO_ATARDECER_HUACACHINA',
      sort_order: 1
    },
    {
      name: 'Tubulares + Sandboard Básico',
      slug: 'tubulares-sandboard-basico',
      description: 'Combina la adrenalina de los tubulares con el sandboard básico. Desliza sobre las dunas con nuestra tabla de iniciación.',
      short_description: 'Tubulares + sandboard básico en Huacachina.',
      duration: '4 horas',
      base_price: 75,
      min_capacity: 2,
      max_capacity: 20,
      category: 'combo',
      image_placeholder: 'IMG_TUBULAR_DUNAS',
      sort_order: 2
    },
    {
      name: 'Pack Romance - Atardecer',
      slug: 'pack-romance-atardecer',
      description: 'Una experiencia mágica para parejas. Tubulares privados, cena romántica en las dunas y fotografía profesional durante el atardecer.',
      short_description: 'Experiencia romántica en Huacachina para parejas.',
      duration: '5 horas',
      base_price: 200,
      min_capacity: 2,
      max_capacity: 2,
      category: 'premium',
      image_placeholder: 'IMG_PAREJA_ATARDECER',
      sort_order: 3
    }
  ];

  const insertExp = db.prepare(`
    INSERT OR IGNORE INTO experiences (name, slug, description, short_description, duration, base_price, min_capacity, max_capacity, category, includes, requirements, restrictions, itinerary, image_placeholder, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const exp of experiences) {
    insertExp.run(exp.name, exp.slug, exp.description, exp.short_description, exp.duration, exp.base_price, exp.min_capacity, exp.max_capacity, exp.category, exp.includes, exp.requirements, exp.restrictions, exp.itinerary, exp.image_placeholder, exp.sort_order);
  }
  console.log(`  ✓ ${experiences.length} experiencias creadas`);

  // Traducciones al inglés para experiencias por defecto
  const updateEn = db.prepare(`UPDATE experiences SET
    name_en = ?, short_description_en = ?, description_en = ?,
    includes_en = ?, requirements_en = ?, restrictions_en = ?, itinerary_en = ?
    WHERE slug = ?
  `);

  const enTranslations = [
    {
      slug: 'tubulares-huacachina',
      name_en: 'Tubular Ride in Huacachina',
      short_description_en: 'Slide down the highest dunes in South America on an exciting tubular ride while the sun sets over the desert.',
      description_en: 'The ultimate Huacachina experience. Enjoy an exciting tubular ride through the highest dunes in South America as the sun sets over the desert, painting the sky in shades of gold and orange.',
      includes_en: JSON.stringify(['Transport from Plaza de Armas → Tierra Prometida', 'Tubular ride (30 min)', 'Professional guide', 'Bottled water', 'Basic insurance']),
      requirements_en: JSON.stringify(['Comfortable clothing', 'Closed-toe shoes', 'Sunscreen', 'Sunglasses']),
      restrictions_en: JSON.stringify(['Not recommended for pregnant women', 'Not recommended for people with back problems']),
      itinerary_en: JSON.stringify([
        { time: '15:00', description: 'Departure from Plaza de Armas' },
        { time: '15:30', description: 'Arrival at Tierra Prometida' },
        { time: '15:45', description: 'Tubular ride begins' },
        { time: '16:45', description: 'Photos in the dunes' },
        { time: '17:15', description: 'Return to Huacachina' }
      ])
    },
    {
      slug: 'tubulares-sandboard-basico',
      name_en: 'Tubular + Sandboard',
      short_description_en: 'Combine adrenaline with sandboarding on the classic Huacachina combo.',
      description_en: 'Combine the thrill of tubular rides with basic sandboarding. Slide down the dunes on a beginner board. Perfect for those who want to try both activities in one go.',
      includes_en: JSON.stringify(['Everything from the basic plan', 'Basic sandboard', 'Sandboard instructor']),
      requirements_en: JSON.stringify(['Comfortable clothing', 'Closed-toe shoes', 'Sunscreen', 'Sunglasses']),
      restrictions_en: JSON.stringify(['Not recommended for pregnant women', 'Not recommended for people with back problems']),
      itinerary_en: JSON.stringify([
        { time: '14:00', description: 'Departure from Plaza de Armas' },
        { time: '14:30', description: 'Arrival at Tierra Prometida' },
        { time: '14:45', description: 'Tubular ride' },
        { time: '15:30', description: 'Sandboard session' },
        { time: '17:00', description: 'Return' }
      ])
    },
    {
      slug: 'pack-romance-atardecer',
      name_en: 'Romance Pack',
      short_description_en: 'Private tubular ride and romantic dinner in the dunes at sunset.',
      description_en: 'A magical experience for couples. Private tubular ride, romantic dinner in the dunes with champagne, professional photography, and special decorations. The perfect sunset date.',
      includes_en: JSON.stringify(['Private tubular (couple only)', 'Romantic dinner in the dunes', 'Champagne or wine', 'Professional photography', 'Special romantic decoration', 'Flexible return']),
      requirements_en: JSON.stringify(['Comfortable clothing', 'Closed-toe shoes']),
      restrictions_en: JSON.stringify(['Not recommended for pregnant women']),
      itinerary_en: JSON.stringify([
        { time: '14:00', description: 'Departure from Plaza de Armas' },
        { time: '14:30', description: 'Arrival at Tierra Prometida' },
        { time: '15:00', description: 'Private tubular ride' },
        { time: '15:45', description: 'Sunset photos' },
        { time: '16:30', description: 'Romantic dinner in the dunes' },
        { time: '18:00', description: 'Return' }
      ])
    }
  ];

  for (const en of enTranslations) {
    updateEn.run(
      en.name_en, en.short_description_en, en.description_en,
      en.includes_en, en.requirements_en, en.restrictions_en, en.itinerary_en,
      en.slug
    );
  }
  console.log(`  ✓ ${enTranslations.length} traducciones al inglés agregadas`);

  // Servicios adicionales
  const services = [
    { name: 'Sandboard Básico', description: 'Tabla de sandboard para principiantes', price: 15, category: 'equipment', sort_order: 1 },
    { name: 'Sandboard Profesional', description: 'Tabla de sandboard profesional', price: 25, category: 'equipment', sort_order: 2 },
    { name: '15 minutos adicionales', description: '15 minutos más de tubulares', price: 10, category: 'experience', sort_order: 3 },
    { name: '30 minutos adicionales', description: '30 minutos más de tubulares', price: 18, category: 'experience', sort_order: 4 },
    { name: 'Fotografía Profesional', description: 'Sesión de fotos profesional', price: 40, category: 'photo', sort_order: 5 },
    { name: 'Video Profesional', description: 'Grabación de video HD', price: 60, category: 'photo', sort_order: 6 },
    { name: 'Drone', description: 'Toma aérea con drone', price: 80, category: 'photo', sort_order: 7 },
    { name: 'Cumpleaños', description: 'Decoración y pastel para cumpleaños', price: 50, category: 'experience', sort_order: 8 },
    { name: 'Pedido de Matrimonio', description: 'Coordinación especial para propuesta', price: 150, category: 'experience', sort_order: 9 },
    { name: 'Cena Romántica', description: 'Cena en las dunas al atardecer', price: 120, category: 'experience', sort_order: 10 },
    { name: 'Tubular Privado', description: 'Tubular solo para tu grupo', price: 80, category: 'experience', sort_order: 11 },
    { name: 'Recogida en Hotel', description: 'Recogida desde tu hotel en Ica', price: 20, category: 'transport', sort_order: 12 },
    { name: 'Regreso desde Huacachina', description: 'Transporte de regreso a Ica', price: 15, category: 'transport', sort_order: 13 },
    { name: 'Transporte Privado', description: 'Transporte privado ida y vuelta', price: 60, category: 'transport', sort_order: 14 },
    { name: 'Snacks', description: 'Snacks variados para el viaje', price: 12, category: 'food', sort_order: 15 },
    { name: 'Agua Mineral', description: 'Botella de agua 1L', price: 3, category: 'food', sort_order: 16 },
    { name: 'Bebidas', description: 'Gaseosa o jugo natural', price: 5, category: 'food', sort_order: 17 },
    { name: 'Bloqueador Solar', description: 'Bloqueador solar factor 50', price: 15, category: 'products', sort_order: 18 },
  ];

  const insertService = db.prepare(
    'INSERT OR IGNORE INTO additional_services (name, description, price, category, sort_order) VALUES (?, ?, ?, ?, ?)'
  );

  for (const service of services) {
    insertService.run(service.name, service.description, service.price, service.category, service.sort_order);
  }
  console.log(`  ✓ ${services.length} servicios adicionales creados`);

  // FAQ
  const faqs = [
    { question: '¿Cómo hago una reserva?', answer: 'Puedes reservar directamente desde nuestra web seleccionando la fecha y hora que prefieras, o contactarnos por WhatsApp.', category: 'reservas' },
    { question: '¿Cuál es el punto de encuentro?', answer: 'El punto de encuentro es la Plaza de Armas de Ica. Desde allí te recogemos para llevarte a Tierra Prometida.', category: 'logística' },
    { question: '¿Qué debo llevar?', answer: 'Recomendamos ropa cómoda, zapatos cerrados, bloqueador solar, lentes de sol y muchas ganas de divertirte.', category: 'preparación' },
    { question: '¿Hay límite de edad?', answer: 'No hay límite de edad, pero los menores deben ir acompañados de un adulto responsable.', category: 'general' },
    { question: '¿Puedo cancelar mi reserva?', answer: 'Sí, puedes cancelar con hasta 24 horas de anticipación para reembolso completo.', category: 'políticas' },
    { question: '¿Ofrecen transporte desde/hacia el hotel?', answer: 'Sí, ofrecemos recogida en hotel como servicio adicional. Puedes agregarlo al hacer tu reserva.', category: 'logística' },
  ];

  const insertFaq = db.prepare(
    'INSERT OR IGNORE INTO faq_items (question, answer, category, sort_order) VALUES (?, ?, ?, ?)'
  );

  faqs.forEach((faq, i) => {
    insertFaq.run(faq.question, faq.answer, faq.category, i + 1);
  });
  console.log(`  ✓ ${faqs.length} preguntas frecuentes creadas`);

  // Settings por defecto
  const settings = [
    { key: 'business_name', value: 'Pacha Experiences', category: 'general', description: 'Nombre del negocio' },
    { key: 'business_ruc', value: '12345678901', category: 'general', description: 'RUC' },
    { key: 'business_phone', value: '+51999000000', category: 'contact', description: 'Teléfono principal' },
    { key: 'business_email', value: 'info@pacha-experiences.com', category: 'contact', description: 'Email principal' },
    { key: 'business_address', value: 'Plaza de Armas de Ica', category: 'contact', description: 'Dirección' },
    { key: 'whatsapp_number', value: '+51999000000', category: 'contact', description: 'Número de WhatsApp' },
    { key: 'currency', value: 'PEN', category: 'general', description: 'Moneda por defecto' },
    { key: 'tax_rate', value: '0.18', category: 'billing', description: 'Tasa de IGV' },
  ];

  const insertSetting = db.prepare(
    'INSERT OR IGNORE INTO settings (key, value, category, description) VALUES (?, ?, ?, ?)'
  );

  for (const setting of settings) {
    insertSetting.run(setting.key, setting.value, setting.category, setting.description);
  }
  console.log(`  ✓ ${settings.length} configuraciones creadas`);

  console.log('✅ Seed completado!\n');
}

seed().catch(console.error);
