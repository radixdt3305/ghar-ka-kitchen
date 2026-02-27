import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "./button";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ value, onChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      await new Promise((resolve) => {
        reader.onloadend = () => {
          newUrls.push(reader.result as string);
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    }

    onChange([...value, ...newUrls].slice(0, maxImages));
    setUploading(false);
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {value.map((url, index) => (
          <div key={index} className="relative aspect-video overflow-hidden rounded-lg border">
            <img src={url} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0"
              onClick={() => removeImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {value.length < maxImages && (
          <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400">
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-xs text-gray-500">
              {uploading ? "Uploading..." : "Upload Image"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-gray-500">
        {value.length}/{maxImages} images • Click to upload
      </p>
    </div>
  );
}
