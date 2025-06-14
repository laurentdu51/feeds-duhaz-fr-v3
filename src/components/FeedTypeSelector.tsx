
import { Button } from '@/components/ui/button';
import { feedTypeOptions } from './FeedTypeOptions';

interface FeedTypeSelectorProps {
  onTypeSelect: (type: string) => void;
}

const FeedTypeSelector = ({ onTypeSelect }: FeedTypeSelectorProps) => {
  return (
    <div className="space-y-3">
      {feedTypeOptions.map((option) => {
        const IconComponent = option.icon;
        return (
          <Button
            key={option.value}
            variant="outline"
            className="w-full justify-start gap-3 h-auto p-4"
            onClick={() => onTypeSelect(option.value)}
          >
            <div className={`p-2 rounded ${option.color} text-white`}>
              <IconComponent className="h-4 w-4" />
            </div>
            <span>{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default FeedTypeSelector;
