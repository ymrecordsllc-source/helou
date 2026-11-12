import { Product, Magazine, Release, AwardEvent, Photocard, AlbumTrack, SurvivalShow } from '../types';

export const INITIAL_PHOTOCARDS_ECLIPSE: Photocard[] = [];
export const INITIAL_PREORDER_BENEFITS: Photocard[] = [];
export const INITIAL_TRACKS_ECLIPSE: AlbumTrack[] = [];

// Default lists are cleared as requested: no default products, magazines, releases or survivals
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_MAGAZINES: Magazine[] = [];
export const INITIAL_RELEASES: Release[] = [];

export const INITIAL_AWARDS: AwardEvent[] = [
  {
    id: 'award-2026',
    title: 'YM-ki Music & Performance Awards (YMMA 2026)',
    description: 'La máxima premiación anual de la agencia donde los fans eligen a sus artistas, coreografías y lanzamientos favoritos.',
    banner: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    isActive: true,
    createdBy: 'YM-ki Entertainment',
    createdAt: new Date().toISOString(),
    categories: [
      {
        id: 'cat-art-year',
        name: 'Artista del Año (Artist of the Year)',
        description: 'Premio al artista o grupo con mayor impacto escénico, talento y conexión con el fandom.',
        votesLimitPerUser: 3,
        nominees: [
          {
            id: 'nom-allstars',
            name: 'YM-ki All Stars',
            subtitle: 'Lanzamiento: ECLIPSE',
            image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
            votes: 245
          },
          {
            id: 'nom-hana',
            name: 'Hana Star (Solo Act)',
            subtitle: 'Lanzamiento: Starlight Illusion',
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
            votes: 189
          },
          {
            id: 'nom-trainees',
            name: 'YM-ki Trainees',
            subtitle: 'Lanzamiento: Neon Horizon',
            image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
            votes: 154
          }
        ]
      },
      {
        id: 'cat-best-mv',
        name: 'Mejor Video Musical (Best MV & Visuals)',
        description: 'Reconocimiento a la dirección artística, cinematografía y producción audiovisual.',
        votesLimitPerUser: 3,
        nominees: [
          {
            id: 'nom-mv-eclipse',
            name: 'ECLIPSE - YM-ki All Stars',
            subtitle: 'Dirigido por YM-ki Studios',
            image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&auto=format&fit=crop&q=80',
            votes: 310
          },
          {
            id: 'nom-mv-neon',
            name: 'NEON HORIZON Teaser Film',
            subtitle: 'Dirigido por CyberFrame Labs',
            image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&auto=format&fit=crop&q=80',
            votes: 198
          }
        ]
      },
      {
        id: 'cat-best-dance',
        name: 'Mejor Coreografía & Performance',
        description: 'Premio a la coordinación rítmica, presencia escénica y creatividad coreográfica.',
        votesLimitPerUser: 2,
        nominees: [
          {
            id: 'nom-dance-eclipse',
            name: 'ECLIPSE (Point Dance Chorus)',
            subtitle: 'Coreografía por CEO Sora & Jin',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
            votes: 280
          },
          {
            id: 'nom-dance-velocity',
            name: 'Velocity Rush Dance Break',
            subtitle: 'Coreografía por Trainee Team Alpha',
            image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
            votes: 172
          }
        ]
      }
    ]
  }
];

export const INITIAL_SURVIVALS: SurvivalShow[] = [];

