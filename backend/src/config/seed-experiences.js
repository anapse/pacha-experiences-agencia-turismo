const { initDatabase, getDatabase } = require('./database');
initDatabase();
const db = getDatabase();

const experiences = [
  {
    name: 'Tubulares en Huacachina',
    slug: 'tubulares-huacachina',
    short_description: 'Emocionante paseo en tubulares por las dunas de Huacachina al atardecer.',
    description: 'La experiencia definitiva en Huacachina. Disfruta de un emocionante paseo en tubulares por las dunas más altas de Sudamérica mientras el sol se pone sobre el desierto.',
    duration: '2 horas',
    base_price: 50, min_capacity: 2, max_capacity: 20,
    category: 'tubular',
    includes: JSON.stringify(['Transporte Plaza de Armas', 'Paseo en tubular (30 min)', 'Guía profesional', 'Agua mineral', 'Seguro básico']),
    image_placeholder: 'IMG_TUBULAR_DUNAS', sort_order: 1
  },
  {
    name: 'Tubulares + Sandboard Básico',
    slug: 'tubulares-sandboard-basico',
    short_description: 'Tubulares + sandboard básico. La combinación clásica de Huacachina.',
    description: 'Combina la adrenalina de los tubulares con el sandboard. Deslízate sobre las dunas con tabla de iniciación. Ideal para quienes quieren probar ambas actividades.',
    duration: '3 horas',
    base_price: 75, min_capacity: 2, max_capacity: 20,
    category: 'combo',
    includes: JSON.stringify(['Todo del plan básico', 'Sandboard básico', 'Instructor de sandboard']),
    image_placeholder: 'IMG_SANDBOARD', sort_order: 2
  },
  {
    name: 'Full Experience - Tubulares + Sandboard Pro',
    slug: 'full-experience',
    short_description: 'La experiencia completa: tubular, sandboard pro, 15 min extra y fotografía.',
    description: 'Nuestro plan más vendido. Tubulares, sandboard profesional, 15 min adicionales y fotografía básica. La mejor relación calidad-precio.',
    duration: '3.5 horas',
    base_price: 90, min_capacity: 2, max_capacity: 20,
    category: 'combo',
    includes: JSON.stringify(['Todo del plan básico', 'Sandboard profesional', '15 min adicionales de tubular', 'Fotografía básica (10 fotos)', 'Instructor especializado']),
    image_placeholder: 'IMG_CANAM', sort_order: 3
  },
  {
    name: 'Premium - Tubulares + Drone + Todo',
    slug: 'premium-experience',
    short_description: 'La experiencia definitiva: tubular, sandboard pro, video con drone y más.',
    description: 'Nuestra experiencia tope de gama. Tubulares, sandboard profesional, 30 min adicionales, video con drone, fotografía profesional y regreso flexible.',
    duration: '4 horas',
    base_price: 150, min_capacity: 2, max_capacity: 20,
    category: 'premium',
    includes: JSON.stringify(['Todo del plan Full', '30 min adicionales de tubular', 'Video profesional con drone', 'Fotografía profesional (30 fotos)', 'Decoración especial', 'Regreso flexible desde Huacachina']),
    image_placeholder: 'IMG_BUGGY_ADVENTURE', sort_order: 4
  },
  {
    name: 'Pack Romance - Atardecer para Dos',
    slug: 'pack-romance',
    short_description: 'Tubulares privados, cena romántica y fotos al atardecer. Solo para 2.',
    description: 'Experiencia mágica para parejas. Tubulares privados, cena romántica en las dunas con champagne, fotografía profesional y decoración especial.',
    duration: '4 horas',
    base_price: 200, min_capacity: 2, max_capacity: 2,
    category: 'premium',
    includes: JSON.stringify(['Tubular privado (solo la pareja)', 'Cena romántica en las dunas', 'Champagne o vino', 'Fotografía profesional', 'Decoración especial romántica', 'Regreso flexible']),
    image_placeholder: 'IMG_PAREJA_ATARDECER', sort_order: 5
  },
  {
    name: 'Sandboard Extremo + Video Drone',
    slug: 'sandboard-extremo-drone',
    short_description: 'Sandboard profesional en dunas de 300m con grabación de drone incluida.',
    description: 'Sandboard profesional en las dunas más altas con instructores expertos. Incluye grabación con drone y edición de video profesional.',
    duration: '3 horas',
    base_price: 85, min_capacity: 1, max_capacity: 10,
    category: 'adventure',
    includes: JSON.stringify(['Sandboard profesional', 'Instructor especializado', 'Video con drone', 'Fotos profesionales', 'Edición de video incluida', 'Equipo completo']),
    image_placeholder: 'IMG_BUGGY_ATARDECER', sort_order: 6
  },
  {
    name: 'Cena en el Desierto - Atardecer + Estrellas',
    slug: 'cena-desierto',
    short_description: 'Cena privada bajo las estrellas con buggy al atardecer en las dunas.',
    description: 'Comienza con buggy al atardecer, luego cena privada con chef en medio de las dunas con vino, música y fogata bajo las estrellas.',
    duration: '5 horas',
    base_price: 280, min_capacity: 2, max_capacity: 8,
    category: 'premium',
    includes: JSON.stringify(['Buggy al atardecer', 'Cena privada con chef', 'Vino y bebidas ilimitadas', 'Fogata bajo las estrellas', 'Fotografía profesional', 'Transporte privado']),
    image_placeholder: 'IMG_HUACACHINA_NOCHE', sort_order: 7
  },
  {
    name: 'Tour Vino, Pisco y Tubulares',
    slug: 'vino-pisco-tubulares',
    short_description: 'Cata de vinos y pisco + paseo en tubulares. Día completo en Ica.',
    description: 'Visita a bodega tradicional con cata de vinos y pisco, almuerzo típico y tubulares en Huacachina al atardecer.',
    duration: '8 horas',
    base_price: 130, min_capacity: 2, max_capacity: 15,
    category: 'tour',
    includes: JSON.stringify(['Visita a bodega tradicional', 'Cata de vinos y pisco', 'Almuerzo típico', 'Tubulares en Huacachina', 'Guía turístico', 'Transporte']),
    image_placeholder: 'IMG_MUJER_BUGGY', sort_order: 8
  },
  {
    name: 'Cumpleaños en las Dunas',
    slug: 'cumpleanos-dunas',
    short_description: 'Celebra tu cumpleaños en Huacachina con decoración, torta y tubulares.',
    description: 'Celebración única: tubulares, sandboard, decoración especial, torta y canto de cumpleaños en las dunas al atardecer con fotos y video.',
    duration: '3.5 horas',
    base_price: 160, min_capacity: 4, max_capacity: 20,
    category: 'event',
    includes: JSON.stringify(['Tubulares', 'Sandboard básico', 'Decoración de cumpleaños', 'Torta y champagne', 'Fotografía (20 fotos)', 'Video resumen']),
    image_placeholder: 'IMG_CLIENTE_DIVERTIDO', sort_order: 9
  },
  {
    name: 'Propuesta de Matrimonio en las Dunas',
    slug: 'propuesta-matrimonio',
    short_description: 'El escenario perfecto para pedirle matrimonio. Atardecer, champán y fotos.',
    description: 'Organizamos la pedida perfecta: llegada en tubular privado, decoración con pétalos y letrero, champán, fotógrafo oculto capturando el momento. Inolvidable.',
    duration: '4 horas',
    base_price: 350, min_capacity: 2, max_capacity: 2,
    category: 'premium',
    includes: JSON.stringify(['Tubular privado', 'Decoración especial (pétalos, letrero)', 'Champagne premium', 'Fotógrafo profesional oculto', 'Video de la propuesta', 'Cena romántica posterior']),
    image_placeholder: 'IMG_CAROUSEL_SOLO', sort_order: 10
  },
];

const upsert = db.prepare(`
  INSERT INTO experiences (name, slug, short_description, description, duration, base_price, min_capacity, max_capacity, category, includes, image_placeholder, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(slug) DO UPDATE SET
    name=excluded.name, short_description=excluded.short_description, description=excluded.description,
    duration=excluded.duration, base_price=excluded.base_price, min_capacity=excluded.min_capacity,
    max_capacity=excluded.max_capacity, category=excluded.category, includes=excluded.includes,
    image_placeholder=excluded.image_placeholder, sort_order=excluded.sort_order
`);

for (const exp of experiences) {
  upsert.run(exp.name, exp.slug, exp.short_description, exp.description, exp.duration,
    exp.base_price, exp.min_capacity, exp.max_capacity, exp.category, exp.includes,
    exp.image_placeholder, exp.sort_order);
}

console.log('✓ ' + experiences.length + ' experiencias insertadas/actualizadas');
console.log('Total en DB:', db.prepare('SELECT COUNT(*) as c FROM experiences').get().c);
console.log('');
const all = db.prepare('SELECT name, slug, base_price, category FROM experiences ORDER BY sort_order').all();
all.forEach(e => console.log('  ' + e.category.padEnd(12) + ' S/' + String(e.base_price).padStart(4) + '  ' + e.name));
