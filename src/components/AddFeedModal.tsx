
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { 
  Globe, 
  Rss, 
  Play, 
  Gamepad2,
  Newspaper 
} from 'lucide-react';
import { NewsCategory } from '@/types/news';

interface AddFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFeed: (feedData: any) => void;
  categories: NewsCategory[];
}

interface FeedFormData {
  name: string;
  url: string;
  category: string;
  description?: string;
}

const feedTypeOptions = [
  { value: 'website', label: "D'un site web", icon: Globe, color: 'bg-blue-500' },
  { value: 'rss-auto', label: "D'un flux RSS (automatique)", icon: Rss, color: 'bg-orange-500' },
  { value: 'rss-manual', label: "D'un flux RSS (manuel)", icon: Rss, color: 'bg-yellow-500' },
  { value: 'youtube', label: "D'une chaîne YouTube", icon: Play, color: 'bg-red-500' },
  { value: 'steam', label: "D'un Jeu présent sur Steam", icon: Gamepad2, color: 'bg-gray-700' },
];

// Function to extract YouTube channel ID from various URL formats
const extractYouTubeChannelId = (url: string): string | null => {
  const patterns = [
    // Channel ID format: https://www.youtube.com/channel/UCxxxxxx
    /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
    // Handle format: https://www.youtube.com/c/ChannelName
    /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
    // User format: https://www.youtube.com/user/username
    /youtube\.com\/user\/([a-zA-Z0-9_-]+)/,
    // Custom URL format: https://www.youtube.com/@channelname
    /youtube\.com\/@([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
};

// Function to convert YouTube channel URL to RSS feed URL
const convertYouTubeToRSS = (url: string): string => {
  // If it's already an RSS feed URL, return as is
  if (url.includes('feeds/videos.xml')) {
    return url;
  }

  const channelId = extractYouTubeChannelId(url);
  
  if (channelId) {
    // For channel ID format, we can directly create the RSS URL
    if (url.includes('/channel/')) {
      return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    }
    
    // For other formats (@username, /c/, /user/), we need to note that
    // the RSS conversion might need the actual channel ID
    // For now, we'll try with the extracted identifier
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  }
  
  // If we can't extract the channel ID, return the original URL
  return url;
};

const AddFeedModal = ({ isOpen, onClose, onAddFeed, categories }: AddFeedModalProps) => {
  const [selectedType, setSelectedType] = useState<string>('');
  
  const form = useForm<FeedFormData>({
    defaultValues: {
      name: '',
      url: '',
      category: '',
      description: '',
    },
  });

  const handleSubmit = (data: FeedFormData) => {
    let processedUrl = data.url;
    
    // If it's a YouTube feed, convert the URL to RSS format
    if (selectedType === 'youtube') {
      processedUrl = convertYouTubeToRSS(data.url);
      console.log('YouTube URL converted:', { original: data.url, converted: processedUrl });
    }
    
    const feedData = {
      ...data,
      url: processedUrl,
      type: selectedType,
      id: Date.now().toString(), // Simple ID generation
    };
    
    onAddFeed(feedData);
    form.reset();
    setSelectedType('');
    onClose();
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  const handleCancel = () => {
    form.reset();
    setSelectedType('');
    onClose();
  };

  const selectedTypeOption = feedTypeOptions.find(option => option.value === selectedType);

  const getUrlPlaceholder = () => {
    switch (selectedType) {
      case 'youtube':
        return 'https://www.youtube.com/@channelname ou https://www.youtube.com/channel/UCxxxxx';
      case 'rss-auto':
      case 'rss-manual':
        return 'https://example.com/feed.xml';
      default:
        return 'https://...';
    }
  };

  const getUrlHelperText = () => {
    if (selectedType === 'youtube') {
      return 'Collez le lien de la chaîne YouTube (sera automatiquement converti en flux RSS)';
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rss className="h-5 w-5" />
            Ajouter un nouveau flux
          </DialogTitle>
          <DialogDescription>
            Choisissez le type de flux que vous souhaitez ajouter
          </DialogDescription>
        </DialogHeader>

        {!selectedType ? (
          <div className="space-y-3">
            {feedTypeOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <Button
                  key={option.value}
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto p-4"
                  onClick={() => handleTypeSelect(option.value)}
                >
                  <div className={`p-2 rounded ${option.color} text-white`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <span>{option.label}</span>
                </Button>
              );
            })}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                {selectedTypeOption && (
                  <>
                    <div className={`p-2 rounded ${selectedTypeOption.color} text-white`}>
                      <selectedTypeOption.icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{selectedTypeOption.label}</span>
                  </>
                )}
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du flux</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nom du flux..." 
                        {...field} 
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={getUrlPlaceholder()}
                        type="url"
                        {...field} 
                        required
                      />
                    </FormControl>
                    {getUrlHelperText() && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {getUrlHelperText()}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description du flux..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
                <Button type="submit">
                  Ajouter le flux
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {!selectedType && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddFeedModal;
