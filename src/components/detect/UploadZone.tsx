// src/components/detect/UploadZone.tsx

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Leaf, Search } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  loadingStep: string;
}

export const UploadZone = ({ onFileSelect, isLoading, loadingStep }: UploadZoneProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    disabled: isLoading
  } as any);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setSelectedFile(null);
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="space-y-6">
      <div 
        {...getRootProps()} 
        className={clsx(
          "relative h-[400px] rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden",
          isDragActive ? "border-accent-green bg-accent-green/5" : "border-border-light bg-bg-card/50 hover:border-accent-green hover:bg-bg-card",
          isLoading && "pointer-events-none opacity-80"
        )}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="relative w-full h-full p-4">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover rounded-2xl" 
            />
            <button 
              onClick={handleRemove}
              className="absolute top-6 right-6 p-2 bg-accent-red text-white rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <X className="h-5 w-5" />
            </button>
            {isLoading && (
              <div className="absolute inset-0 bg-bg-primary/60 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-accent-green/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-accent-green rounded-full border-t-transparent animate-spin" />
                  <Search className="absolute inset-0 m-auto h-8 w-8 text-accent-green animate-pulse" />
                </div>
                <p className="text-xl font-bold text-text-primary animate-pulse">{loadingStep}</p>
                <div className="mt-8 w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-green animate-[scan_2s_linear_infinite]" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8">
            <div className="mb-6 relative inline-block">
              <div className="h-20 w-20 rounded-2xl bg-accent-green/10 flex items-center justify-center text-accent-green">
                <Leaf className="h-10 w-10" />
              </div>
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-accent-lime rounded-full flex items-center justify-center text-bg-primary">
                <Upload className="h-3 w-3 font-bold" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Drop your leaf photo here</h3>
            <p className="text-text-muted mb-6">or click to browse from your device</p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-text-muted border border-white/10 uppercase tracking-wider">JPG</span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-text-muted border border-white/10 uppercase tracking-wider">PNG</span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-text-muted border border-white/10 uppercase tracking-wider">WEBP</span>
            </div>
          </div>
        )}

        {isDragActive && !preview && (
          <div className="absolute inset-0 bg-accent-green/10 border-4 border-accent-green border-dashed animate-pulse" />
        )}
      </div>

      {!isLoading && (
        <Button 
          className="w-full py-4 text-lg"
          disabled={!selectedFile}
          onClick={handleAnalyze}
        >
          <Search className="mr-2 h-5 w-5" />
          Analyze Now
        </Button>
      )}
    </div>
  );
};
