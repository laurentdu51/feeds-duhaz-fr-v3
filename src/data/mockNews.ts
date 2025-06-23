
import { NewsItem, NewsCategory } from '@/types/news';

export const categories: NewsCategory[] = [
  { id: '1', name: 'Flux Rss', type: 'rss', color: 'bg-blue-500', icon: 'rss' },
  { id: '2', name: 'YouTube', type: 'youtube', color: 'bg-red-500', icon: 'play' },
  { id: '3', name: 'Steam', type: 'steam', color: 'bg-gray-700', icon: 'gamepad-2' },
  { id: '4', name: 'Actualités', type: 'actualites', color: 'bg-green-500', icon: 'newspaper' },
];

export const newsItems: NewsItem[] = [
  {
    id: '1',
    title: "Google vient enfin d'améliorer deux fonctions essentielles pour les utilisateurs dans Google Messages",
    description: "L'application Google Messages poursuit son évolution avec le remaniement de sa galerie et de l'interface de son appareil photo.",
    content: "L'application Google Messages continue d'évoluer pour offrir une meilleure expérience utilisateur. Les dernières améliorations concernent principalement l'interface de la galerie photo et les fonctionnalités de l'appareil photo intégré.",
    source: "Clubic - News",
    category: 'rss',
    publishedAt: "2024-06-06T10:00:00Z",
    readTime: 3,
    isPinned: false,
    isRead: false,
    imageUrl: "/placeholder.svg"
  },
  {
    id: '2',
    title: "Test Asus ROG Delta II : identité gamer et immersion complète pour ce casque sans fil",
    description: "On le voit de plus en plus sur la tête des joueurs d'eSport pros et des streamers. L'Asus ROG Delta II mise sur une esthétique affirmée, sans négliger pour autant un son riche et immersif.",
    content: "Le nouveau casque gaming d'Asus impressionne par sa qualité audio et son design soigné. Avec ses fonctionnalités avancées comme la charge rapide et le mode tri connecté, il se positionne parmi les références du marché.",
    source: "Clubic - News", 
    category: 'rss',
    publishedAt: "2024-06-06T09:30:00Z",
    readTime: 5,
    isPinned: true,
    isRead: false,
    imageUrl: "/placeholder.svg"
  },
  {
    id: '3',
    title: "Vis mon job ! Des demandeurs d'emploi en immersion avec des conseillers clientèle d'une banque du Sud-Ouest",
    description: "Cette opération est le fruit d'un partenariat entre France Travail et le club 'Les entreprises s'engagent en Charente'. Une initiative qui permet aux demandeurs d'emploi de découvrir les métiers directement avec des professionnels.",
    content: "Une initiative originale qui permet aux demandeurs d'emploi de découvrir concrètement les métiers du conseil clientèle bancaire à travers des immersions professionnelles.",
    source: "France3 - Actualités à la Une",
    category: 'actualites',
    publishedAt: "2024-06-06T08:45:00Z",
    readTime: 4,
    isPinned: false,
    isRead: true,
    imageUrl: "/placeholder.svg"
  },
  {
    id: '4',
    title: "L'Arme Laser qui Montre la Vraie Puissance des USA 🇺🇸⚡",
    description: "Découverte des technologies laser militaires américaines et de leur impact sur la défense moderne.",
    content: "Les États-Unis développent des systèmes d'armes laser révolutionnaires qui changent la donne en matière de défense militaire.",
    source: "YouTube Tech",
    category: 'youtube',
    publishedAt: "2024-06-06T07:15:00Z",
    readTime: 8,
    isPinned: false,
    isRead: false,
    imageUrl: "/placeholder.svg"
  }
];
