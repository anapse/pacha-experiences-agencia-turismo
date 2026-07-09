const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db = null;

function initDatabase() {
  if (db) return db;

  const dbPath = path.resolve(__dirname, '..', '..', process.env.DB_PATH || '../database/data.sqlite');
  const dbDir = path.dirname(dbPath);

  // Asegurar que el directorio existe
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbPath);

  // Performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  // Crear esquema
  createTables(db);

  // Migraciones: agregar columnas de traducción para experiencias
  const translationColumns = [
    'name_en',
    'short_description_en',
    'description_en',
    'includes_en',
    'requirements_en',
    'restrictions_en',
    'itinerary_en'
  ];
  for (const col of translationColumns) {
    try {
      db.exec(`ALTER TABLE experiences ADD COLUMN ${col} TEXT`);
    } catch (e) {
      // La columna ya existe — ignorar
    }
  }

  return db;
}

function createTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('admin','advisor','driver','operator','client')),
      avatar_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE REFERENCES users(id),
      document_type TEXT DEFAULT 'dni',
      document_number TEXT,
      nationality TEXT DEFAULT 'Peruana',
      birth_date DATE,
      emergency_contact TEXT,
      emergency_phone TEXT,
      notes TEXT,
      total_visits INTEGER DEFAULT 0,
      last_visit DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      short_description TEXT,
      duration TEXT,
      base_price REAL NOT NULL,
      currency TEXT DEFAULT 'PEN',
      min_capacity INTEGER DEFAULT 1,
      max_capacity INTEGER DEFAULT 20,
      category TEXT DEFAULT 'tubular',
      includes TEXT,
      requirements TEXT,
      restrictions TEXT,
      itinerary TEXT,
      image_placeholder TEXT,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      plate TEXT UNIQUE NOT NULL,
      type TEXT CHECK(type IN ('car','van','minibus','bus','other')),
      capacity INTEGER NOT NULL,
      year INTEGER,
      brand TEXT,
      model TEXT,
      color TEXT,
      is_active INTEGER DEFAULT 1,
      last_maintenance DATE,
      next_maintenance DATE,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      experience_id INTEGER REFERENCES experiences(id),
      date DATE NOT NULL,
      time TIME NOT NULL,
      min_capacity INTEGER,
      max_capacity INTEGER,
      current_bookings INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','full','cancelled')),
      vehicle_id INTEGER REFERENCES vehicles(id),
      driver_id INTEGER REFERENCES users(id),
      operator_id INTEGER REFERENCES users(id),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS additional_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      currency TEXT DEFAULT 'PEN',
      category TEXT,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_code TEXT UNIQUE NOT NULL,
      client_id INTEGER REFERENCES clients(id),
      schedule_id INTEGER REFERENCES schedules(id),
      advisor_id INTEGER REFERENCES users(id),
      pax_count INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      paid_amount REAL DEFAULT 0,
      currency TEXT DEFAULT 'PEN',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','in_progress','completed','cancelled')),
      payment_status TEXT DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid','partial','paid','refunded')),
      source TEXT DEFAULT 'web' CHECK(source IN ('web','whatsapp','walkin','phone','advisor')),
      notes TEXT,
      emergency_contact TEXT,
      emergency_phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS booking_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
      service_id INTEGER REFERENCES additional_services(id),
      quantity INTEGER DEFAULT 1,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER REFERENCES bookings(id),
      ticket_code TEXT UNIQUE NOT NULL,
      qr_code TEXT,
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      valid_until DATE,
      is_used INTEGER DEFAULT 0,
      used_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER REFERENCES bookings(id),
      amount REAL NOT NULL,
      method TEXT CHECK(method IN ('cash','card','transfer','yape','plin','other')),
      reference TEXT,
      received_by INTEGER REFERENCES users(id),
      notes TEXT,
      paid_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER REFERENCES bookings(id),
      invoice_number TEXT UNIQUE NOT NULL,
      invoice_type TEXT CHECK(invoice_type IN ('boleta','factura')),
      ruc TEXT,
      business_name TEXT,
      subtotal REAL NOT NULL,
      igv REAL NOT NULL,
      total REAL NOT NULL,
      pdf_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant1_id INTEGER REFERENCES users(id),
      participant2_id INTEGER REFERENCES users(id),
      booking_id INTEGER REFERENCES bookings(id),
      last_message TEXT,
      last_message_at DATETIME,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER REFERENCES chat_conversations(id),
      sender_id INTEGER REFERENCES users(id),
      message TEXT,
      message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text','image','file','emergency')),
      is_read INTEGER DEFAULT 0,
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS emergencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER REFERENCES bookings(id),
      reported_by INTEGER REFERENCES users(id),
      type TEXT CHECK(type IN ('injury','dizziness','mechanical','weather','other')),
      severity TEXT CHECK(severity IN ('low','medium','high','critical')),
      description TEXT NOT NULL,
      location TEXT,
      status TEXT DEFAULT 'open' CHECK(status IN ('open','in_progress','resolved','closed')),
      resolved_by INTEGER REFERENCES users(id),
      resolved_at DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT,
      author_id INTEGER REFERENCES users(id),
      image_placeholder TEXT,
      tags TEXT,
      is_published INTEGER DEFAULT 0,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS faq_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      category TEXT DEFAULT 'general',
      description TEXT
    );

    -- Estadísticas de visitas
    CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      ip TEXT,
      user_agent TEXT,
      referrer TEXT,
      session_id TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL,
      visits INTEGER DEFAULT 0,
      unique_visitors INTEGER DEFAULT 0,
      pageviews INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabla para slides del carrusel del Home
    CREATE TABLE IF NOT EXISTS carousel_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_placeholder TEXT NOT NULL,
      title_es TEXT NOT NULL,
      title_en TEXT,
      desc_es TEXT NOT NULL,
      desc_en TEXT,
      cta_es TEXT DEFAULT 'Ver más',
      cta_en TEXT DEFAULT 'View more',
      link TEXT DEFAULT '/experiencias',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Seed data: 9 slides del carrusel principal
    INSERT OR IGNORE INTO carousel_slides (id, image_placeholder, title_es, title_en, desc_es, desc_en, cta_es, cta_en, link, sort_order, is_active) VALUES
    (1, '[IMG_HERO_ATARDECER_HUACACHINA]', 'Vive la aventura en las dunas', 'Live the adventure on the dunes', 'Tubulares, sandboard y experiencias únicas en el desierto peruano.', 'Tubular rides, sandboard, and unique experiences in the Peruvian desert.', 'Explorar Experiencias', 'Explore Experiences', '/experiencias', 0, 1),
    (2, '[IMG_HERO_BUGGIES]', 'Tubulares extremos', 'Extreme tubular rides', '30 minutos de adrenalina pura sobre las dunas más altas de Sudamérica.', '30 minutes of pure adrenaline on the highest dunes in South America.', 'Reservar Ahora', 'Book Now', '/experiencias', 1, 1),
    (3, '[IMG_HERO_BUGGY_OASIS]', 'Pack Romance', 'Romance Pack', 'Una experiencia mágica para parejas. Tubulares privados y cena romántica.', 'A magical experience for couples. Private tubular ride and romantic dinner.', 'Ver Pack', 'View Pack', '/experiencias', 2, 1),
    (4, '[IMG_CAROUSEL_BUGGY]', 'Aventura en grupo', 'Group adventure', 'Comparte la emoción con amigos y familia.', 'Share the excitement with friends and family.', 'Ver Tours', 'View Tours', '/experiencias', 3, 1),
    (5, '[IMG_CAROUSEL_SOLO]', 'Atardeceres únicos', 'Unique sunsets', 'El sol pintando de dorado las dunas más altas de Sudamérica.', 'The sun painting the highest dunes of South America in gold.', 'Descubrir', 'Discover', '/experiencias', 4, 1),
    (6, '[IMG_BANNER_GRUPO]', 'Momentos inolvidables', 'Unforgettable moments', 'Cada viaje es una historia que merece ser contada.', 'Every trip is a story waiting to be told.', 'Vive tu historia', 'Live your story', '/experiencias', 5, 1),
    (7, '[IMG_CAROUSEL_BUGGY_SUNSET]', 'Aventura garantizada', 'Adventure guaranteed', 'Seguridad y diversión en cada recorrido.', 'Safety and fun on every ride.', 'Más Info', 'More Info', '/experiencias', 6, 1),
    (8, '[IMG_BANNER_DESERT]', 'Explora el desierto', 'Explore the desert', 'Huacachina te espera con sus dunas y atardeceres únicos.', 'Huacachina awaits you with its dunes and unique sunsets.', 'Explorar', 'Explore', '/experiencias', 7, 1),
    (9, '[IMG_HUACACHINA_NOCHE]', 'Magia bajo las estrellas', 'Magic under the stars', 'El desierto más imponente de Sudamérica bajo un manto de estrellas.', 'South America''s most imposing desert under a blanket of stars.', 'Ver más', 'View more', '/experiencias', 8, 1);

    -- Índices
    CREATE INDEX IF NOT EXISTS idx_bookings_schedule ON bookings(schedule_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(created_at);
    CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
    CREATE INDEX IF NOT EXISTS idx_schedules_experience ON schedules(experience_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(conversation_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_emergencies_status ON emergencies(status);
    CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
  `);
}

function getDatabase() {
  if (!db) {
    return initDatabase();
  }
  return db;
}

module.exports = { initDatabase, getDatabase };
