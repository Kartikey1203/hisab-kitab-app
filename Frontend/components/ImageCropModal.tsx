import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { CloseIcon } from './icons';

interface ImageCropModalProps {
  onClose: () => void;
  onCropComplete: (croppedImageBlob: Blob) => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ onClose, onCropComplete }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getCroppedImg = (): Promise<Blob | null> => {
    if (!completedCrop || !imgRef.current) return Promise.resolve(null);

    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return Promise.resolve(null);

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        0.9
      );
    });
  };

  const handleCropComplete = async () => {
    const croppedBlob = await getCroppedImg();
    if (croppedBlob) {
      onCropComplete(croppedBlob);
      onClose();
    } else {
      alert('Failed to crop image. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="card-gradient rounded-2xl shadow-2xl w-full max-w-2xl border border-white/10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Upload Profile Photo</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <CloseIcon />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {!imageSrc && (
            <div>
              <label className="block">
                <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 transition-colors">
                  <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-slate-300">Click to upload an image</p>
                  <p className="mt-1 text-xs text-slate-400">PNG, JPG up to 10MB</p>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={onSelectFile}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {imageSrc && (
            <div className="space-y-4">
              <div className="max-h-96 overflow-auto flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop me"
                    className="max-h-96"
                  />
                </ReactCrop>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setImageSrc('')}
                  className="px-4 py-2 rounded-xl bg-slate-700/50 text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  Choose Different Image
                </button>
                <button
                  onClick={handleCropComplete}
                  className="px-4 py-2 rounded-xl button-gradient text-white hover:shadow-lg transition-all"
                >
                  Crop & Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
