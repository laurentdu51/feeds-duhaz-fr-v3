
import { Globe, Rss, Play, Gamepad2 } from 'lucide-react';

export const feedTypeOptions = [
  { value: 'website', label: "D'un site web", icon: Globe, color: 'bg-blue-500' },
  { value: 'rss-auto', label: "D'un flux RSS (automatique)", icon: Rss, color: 'bg-orange-500' },
  { value: 'rss-manual', label: "D'un flux RSS (manuel)", icon: Rss, color: 'bg-yellow-500' },
  { value: 'youtube', label: "D'une chaîne YouTube", icon: Play, color: 'bg-red-500' },
  { value: 'steam', label: "D'un Jeu présent sur Steam", icon: Gamepad2, color: 'bg-gray-700' },
];
