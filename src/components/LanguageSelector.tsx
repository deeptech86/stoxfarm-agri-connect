import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface LanguageSelectorProps {
  variant?: 'default' | 'transparent';
  scrolled?: boolean;
}

const LanguageSelector = ({ variant = 'default', scrolled = false }: LanguageSelectorProps) => {
  const { language, setLanguage, languages } = useLanguage();
  const currentLanguage = languages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={
            variant === 'transparent'
              ? scrolled
                ? 'text-foreground hover:text-primary'
                : 'text-white/90 hover:text-white hover:bg-white/10'
              : ''
          }
        >
          <Globe className="h-4 w-4 mr-1" />
          <span className="text-sm">{currentLanguage?.nativeName || 'English'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer ${language === lang.code ? 'bg-primary/10 text-primary' : ''}`}
          >
            <span className="flex-1">{lang.nativeName}</span>
            <span className="text-muted-foreground text-xs">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
