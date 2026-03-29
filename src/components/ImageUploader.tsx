import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadService } from '@/services/upload.service';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  category?: string;
  disabled?: boolean;
}

const ImageUploader = ({ value, onChange, category = 'produce', disabled = false }: ImageUploaderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file
    const validation = uploadService.validateFile(file);
    if (!validation.valid) {
      toast({
        title: 'Invalid file',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadService.uploadImage(file, category);
      onChange(response.url);
      toast({
        title: 'Image uploaded',
        description: 'Your image has been uploaded successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error?.response?.data?.message || 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [category, onChange, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleUrlSubmit = async () => {
    // Validate URL
    const validation = uploadService.validateUrl(urlInput);
    if (!validation.valid) {
      toast({
        title: 'Invalid URL',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadService.uploadFromUrl(urlInput, category);
      onChange(response.url);
      setUrlInput('');
      toast({
        title: 'Image uploaded',
        description: 'Image has been downloaded and saved.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error?.response?.data?.message || 'Failed to download image from URL.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-3">
      <Label>Product Image</Label>

      {/* Preview */}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="h-24 w-24 object-cover rounded-lg border"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemove}
            disabled={disabled || isUploading}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Upload Tabs */}
      {!value && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-2">
              <Link className="h-4 w-4" />
              From URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-3">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              } ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled || isUploading}
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, WebP or GIF (max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-3">
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={disabled || isUploading}
              />
              <Button
                type="button"
                onClick={handleUrlSubmit}
                disabled={disabled || isUploading || !urlInput}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Upload'
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Enter a direct image URL. The image will be downloaded and stored.
            </p>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ImageUploader;
