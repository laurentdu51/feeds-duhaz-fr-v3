
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Rss } from 'lucide-react';
import { NewsCategory } from '@/types/news';
import FeedTypeSelector from './FeedTypeSelector';
import FeedForm from './FeedForm';

interface AddFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFeed: (feedData: any) => void;
  categories: NewsCategory[];
}

const AddFeedModal = ({ isOpen, onClose, onAddFeed, categories }: AddFeedModalProps) => {
  const [selectedType, setSelectedType] = useState<string>('');

  const handleSubmit = (feedData: any) => {
    onAddFeed(feedData);
    setSelectedType('');
    onClose();
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  const handleCancel = () => {
    setSelectedType('');
    onClose();
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
          <FeedTypeSelector onTypeSelect={handleTypeSelect} />
        ) : (
          <FeedForm 
            selectedType={selectedType}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            categories={categories}
          />
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
