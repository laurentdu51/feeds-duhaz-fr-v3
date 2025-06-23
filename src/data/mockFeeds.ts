
import { Feed } from '@/types/feed';

export const mockFeeds: Feed[] = [
  {
    id: '1',
    name: 'Le Monde - Actualités',
    url: 'https://www.lemonde.fr/rss/une.xml',
    type: 'rss-auto',
    description: 'Flux principal du journal Le Monde',
    category: 'actualites',
    isFollowed: true,
    lastUpdated: '2024-06-06T10:30:00Z',
    articleCount: 156,
    status: 'active'
  },
  {
    id: '2',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    type: 'rss-auto',
    description: 'Actualités technologiques',
    category: 'rss',
    isFollowed: true,
    lastUpdated: '2024-06-06T09:15:00Z',
    articleCount: 89,
    status: 'active'
  },
  {
    id: '3',
    name: 'Chaîne Gaming FR',
    url: 'https://www.youtube.com/channel/UCexample',
    type: 'youtube',
    description: 'Chaîne YouTube sur les jeux vidéo',
    category: 'youtube',
    isFollowed: false,
    lastUpdated: '2024-06-05T16:45:00Z',
    articleCount: 23,
    status: 'active'
  },
  {
    id: '4',
    name: 'Steam - Cyberpunk 2077',
    url: 'https://store.steampowered.com/app/1091500',
    type: 'steam',
    description: 'Actualités du jeu Cyberpunk 2077',
    category: 'steam',
    isFollowed: true,
    lastUpdated: '2024-06-06T08:20:00Z',
    articleCount: 12,
    status: 'error'
  },
  {
    id: '5',
    name: 'France Info',
    url: 'https://www.francetvinfo.fr/titres.rss',
    type: 'rss-manual',
    description: 'Flux RSS France Info',
    category: 'actualites',
    isFollowed: false,
    lastUpdated: '2024-06-06T11:00:00Z',
    articleCount: 67,
    status: 'pending'
  }
];
