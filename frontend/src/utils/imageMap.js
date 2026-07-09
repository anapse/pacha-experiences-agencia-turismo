/**
 * Mapa de placeholders [IMG_*] a imágenes reales optimizadas.
 * Las imágenes están en /images/ subcarpetas por categoría.
 * Formatos: .jpg (original) o .webp (optimizado)
 */

const IMAGE_MAP = {
  // Hero - Portada principal
  IMG_HERO_ATARDECER_HUACACHINA: '/images/hero/hero_bg_oasis_persona_01.jpg',
  IMG_HERO_BUGGIES: '/images/hero/hero_bg_atardecer_buggies_02.jpg',
  IMG_HERO_BUGGY_OASIS: '/images/hero/hero_bg_buggy_oasis_03.jpg',

  // Banners
  IMG_BANNER_GRUPO: '/images/banner/banner_grupo_atardecer_01.jpg',
  IMG_BANNER_DUNAS: '/images/banner/banner_dunas_llamas_02.jpg',

  // Section backgrounds
  IMG_SECTION_DUNAS: '/images/section/section_bg_dunas_nubes_01.jpg',
  IMG_SECTION_FAMILIA: '/images/section/section_bg_padre_hija_oasis_02.jpg',
  IMG_SECTION_OASIS: '/images/section/section_bg_oasis_atardecer_03.webp',
  IMG_HUACACHINA_NOCHE: '/images/section/section_bg_oasis_noche_04.webp',

  // Cards - Experiencias
  IMG_TUBULAR_DUNAS: '/images/card/card_buggies_fila_01.jpg',
  IMG_SANDBOARD: '/images/card/card_buggies_dunas_02.webp',
  IMG_CANAM: '/images/card/card_canam_conductor_03.jpg',
  IMG_MUJER_BUGGY: '/images/card/card_mujer_buggy_verde_04.jpg',
  IMG_CLIENTE_DIVERTIDO: '/images/card/card_hombre_cargando_amigo_05.jpg',
  IMG_BUGGY_ATARDECER: '/images/card/card_buggy_verde_atardecer_06.jpg',
  IMG_BUGGY_ADVENTURE: '/images/card/card_buggy_amarillo_adventure_07.jpg',

  // Carousel
  IMG_CAROUSEL_SOLO: '/images/carousel/carousel_persona_sola_atardecer_01.webp',
  IMG_CAROUSEL_DUNAS: '/images/carousel/carousel_dunas_sombra_02.webp',
  IMG_CAROUSEL_BUGGY: '/images/carousel/carousel_buggy_verde_persona_alto_03.jpg',
  IMG_CAROUSEL_FELIZ: '/images/carousel/carousel_hombre_alegre_04.webp',
  IMG_CLIENTES_FELICES: '/images/carousel/carousel_hombre_alegre_04.webp',

  // UI / Decorativos
  IMG_SELFIE_PAREJA: '/images/ui/ui_selfie_pareja_luna_01.jpg',
  IMG_TEXTURA_DUNAS: '/images/ui/ui_dunas_textura_02.jpg',
  IMG_CICLISTA: '/images/ui/ui_ciclista_huacachina_03.jpg',
  
  // Transporte
  IMG_TRANSPORTE: '/images/card/card_buggy_amarillo_adventure_07.jpg',

  // Pareja / Romance
  IMG_PAREJA_ATARDECER: '/images/section/section_bg_oasis_atardecer_03.webp',

  // Eventos especiales
  IMG_PROPUESTA_MATRIMONIO: '/images/carousel/carousel_persona_sola_atardecer_01.webp',
  IMG_CUMPLEAÑOS: '/images/banner/banner_grupo_atardecer_01.jpg',
  IMG_GRUPO_EMPRESA: '/images/banner/banner_grupo_atardecer_01.jpg',
};

/**
 * Resuelve un placeholder [IMG_NOMBRE] a su ruta real de imagen.
 * Si no encuentra el placeholder, devuelve null.
 */
export function resolveImage(placeholder) {
  // Limpiar: quitar [IMG_ ... ] y obtener solo el nombre
  const key = placeholder
    .replace(/[\[\]]/g, '')     // quitar [ ]
    .trim();

  return IMAGE_MAP[key] || null;
}

/**
 * Hook personalizado para obtener URL de imagen desde placeholder.
 */
export function getImageUrl(placeholder) {
  const path = resolveImage(placeholder);
  if (!path) return null;
  return path;
}

export default IMAGE_MAP;
