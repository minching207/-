import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  X, 
  Check, 
  Link, 
  RefreshCw, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Layers, 
  Sparkles, 
  FileImage,
  Film
} from 'lucide-react';
import { optimizeImageFile } from '../utils/imageOptimizer';

interface MediaFileUploadProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  accept?: 'image' | 'video' | 'all';
  placeholder?: string;
  helperText?: string;
  previewHeight?: string;
  allowUrlToggle?: boolean;
}

// Check if a URL / Data URL is video
export const isVideoMedia = (url?: string) => {
  if (!url) return false;
  if (url.startsWith('data:video/')) return true;
  if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov') || url.endsWith('.ogg')) return true;
  if (url.includes('video') || url.includes('mixkit.co')) return true;
  return false;
};

// Check if a URL / Data URL is animated GIF
export const isGifMedia = (url?: string) => {
  if (!url) return false;
  if (url.startsWith('data:image/gif')) return true;
  if (url.toLowerCase().endsWith('.gif') || url.toLowerCase().includes('.gif?')) return true;
  return false;
};

/**
 * Single Media File Uploader (Images / Animated GIFs / Videos)
 */
export const MediaFileUpload: React.FC<MediaFileUploadProps> = ({
  label,
  value,
  onChange,
  accept = 'image',
  placeholder = '내 컴퓨터에서 파일(이미지/GIF/영상)을 선택하거나 드래그하세요',
  helperText,
  previewHeight = 'h-36',
  allowUrlToggle = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo = isVideoMedia(value) || accept === 'video';
  const isGif = isGifMedia(value);

  const acceptMime =
    accept === 'image'
      ? 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml'
      : accept === 'video'
      ? 'video/mp4,video/webm,video/ogg,video/quicktime'
      : 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/ogg,video/quicktime';

  // Process file upload
  const handleFileProcess = async (file: File) => {
    setErrorMsg(null);
    setIsProcessing(true);

    const isImageFile = file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);
    const isVideoFile = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|ogg)$/i);

    if (accept === 'image' && !isImageFile) {
      setErrorMsg('이미지 파일(JPG, PNG, WebP, GIF 등)만 업로드할 수 있습니다.');
      setIsProcessing(false);
      return;
    }

    if (accept === 'video' && !isVideoFile) {
      setErrorMsg('영상 파일(MP4, WebM, MOV 등)만 업로드할 수 있습니다.');
      setIsProcessing(false);
      return;
    }

    try {
      if (isImageFile) {
        const optimizedDataUrl = await optimizeImageFile(file, 1400, 0.80);
        onChange(optimizedDataUrl);
      } else if (isVideoFile) {
        if (file.size > 25 * 1024 * 1024) {
          setErrorMsg('영상 파일 크기가 25MB를 초과합니다. 25MB 이하를 권장합니다.');
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          onChange(dataUrl);
          setIsProcessing(false);
        };
        reader.onerror = () => {
          setErrorMsg('영상 파일 읽기 실패');
          setIsProcessing(false);
        };
        reader.readAsDataURL(file);
        return;
      }
    } catch (err: any) {
      console.error('File process error:', err);
      setErrorMsg('파일 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const triggerSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const hasValue = Boolean(value && value.trim().length > 0);

  return (
    <div className="space-y-2 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-medium text-[#A0A09A] flex items-center gap-1.5">
            {accept === 'video' ? (
              <VideoIcon className="w-3.5 h-3.5 text-pink-400" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{label}</span>
          </label>

          {allowUrlToggle && (
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 underline"
            >
              <Link className="w-3 h-3" />
              <span>{showUrlInput ? '파일 업로드로 보기' : 'URL 직접 입력'}</span>
            </button>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptMime}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Direct URL Input Mode */}
      {showUrlInput ? (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... 또는 data:..."
              className="flex-1 px-3 py-2 rounded-lg bg-[#242422] border border-[#3A3A36] text-white text-xs font-mono focus:border-white focus:outline-none"
            />
            {hasValue && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-2 rounded-lg bg-[#2E2E2A] text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-[#40403C]"
                title="지우기"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            웹 이미지/GIF/동영상 주소(URL)를 직접 붙여넣거나 파일 업로드로 전환할 수 있습니다.
          </p>
        </div>
      ) : (
        /* Direct File Drag & Drop / Click Upload Box */
        <div className="space-y-2">
          {hasValue ? (
            /* Media Preview & Replace Container */
            <div className="relative rounded-xl border border-[#40403C] bg-[#1E1E1C] overflow-hidden group">
              <div className={`w-full ${previewHeight} bg-[#141414] flex items-center justify-center relative overflow-hidden`}>
                {isVideo ? (
                  <video
                    src={value}
                    controls
                    className="max-h-full max-w-full object-contain"
                    playsInline
                  />
                ) : (
                  <img
                    src={value}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                )}

                {/* Animated GIF Badge */}
                {isGif && (
                  <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-pink-600/90 text-white text-[10px] font-mono font-bold shadow-md border border-pink-400/40 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>ANIMATED GIF</span>
                  </span>
                )}

                {/* Processing Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-white text-xs gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>파일 변환 중...</span>
                  </div>
                )}
              </div>

              {/* Action Bar on Preview */}
              <div className="px-3.5 py-2.5 bg-[#252522] border-t border-[#333330] flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden text-ellipsis">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isGif ? 'bg-pink-400' : 'bg-emerald-400'}`}></span>
                  <span className="text-[11px] font-mono text-slate-300 truncate">
                    {value?.startsWith('data:image/gif') ? '내 PC 업로드 애니메이션 GIF' : value?.startsWith('data:') ? '내 PC 업로드 파일' : value}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={triggerSelect}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#333330] hover:bg-[#444440] text-white text-xs font-semibold border border-[#484844] transition-colors"
                  >
                    <Upload className="w-3 h-3 text-amber-400" />
                    <span>파일 변경</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="p-1.5 rounded-md bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900/50 transition-colors"
                    title="미디어 삭제"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty Upload Dropzone */
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={triggerSelect}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                isDragging
                  ? 'border-amber-400 bg-amber-400/10'
                  : 'border-[#40403C] hover:border-slate-300 bg-[#222220] hover:bg-[#282824]'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#2E2E2A] border border-[#444440] flex items-center justify-center text-amber-400 shadow-sm">
                {isProcessing ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>

              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white flex items-center justify-center gap-1">
                  <span>내 컴퓨터 파일 업로드</span>
                  <span className="text-[10px] text-amber-400 font-mono font-normal">(클릭 또는 드래그)</span>
                </p>
                <p className="text-[11px] text-[#888880]">
                  {accept === 'image'
                    ? 'JPG, PNG, WebP, GIF (움직이는 GIF 완벽 지원)'
                    : accept === 'video'
                    ? 'MP4, WebM, MOV 동영상 파일 지원'
                    : '이미지, GIF 또는 동영상 파일 지원'}
                </p>
              </div>

              <button
                type="button"
                className="mt-1 px-3 py-1.5 rounded-lg bg-[#30302C] hover:bg-[#3C3C38] text-white text-xs font-semibold border border-[#484844] shadow-2xs"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerSelect();
                }}
              >
                내 PC에서 파일 선택
              </button>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-[11px] text-red-400 font-mono bg-red-950/30 p-2 rounded border border-red-900/50">
          {errorMsg}
        </p>
      )}

      {helperText && !errorMsg && (
        <p className="text-[10px] text-[#888880] font-mono">{helperText}</p>
      )}
    </div>
  );
};


/**
 * Multi-Image & Sliced Detail Page Uploader
 * Allows uploading multiple cut images/GIFs in a single section (e.g. 01_intro.jpg, 02_point.gif, 03_specs.jpg)
 */
interface MultiImageSliceUploadProps {
  label?: string;
  images: string[];
  onChange: (images: string[]) => void;
  layoutMode?: 'seamless' | 'spaced' | 'grid' | 'slide' | 'carousel';
  onLayoutModeChange?: (mode: 'seamless' | 'spaced' | 'grid' | 'slide') => void;
}

export const MultiImageSliceUpload: React.FC<MultiImageSliceUploadProps> = ({
  label = '상세페이지 분할 컷팅 이미지/GIF 업로드 (연속 세로 연결)',
  images = [],
  onChange,
  layoutMode = 'seamless',
  onLayoutModeChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const multiInputRef = useRef<HTMLInputElement>(null);
  const singleReplaceRef = useRef<HTMLInputElement>(null);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  // Process a list of files sequentially
  const processFiles = async (fileList: FileList | File[]) => {
    setErrorMsg(null);
    setIsProcessing(true);

    const newImages: string[] = [];
    const files = Array.from(fileList);

    for (const file of files) {
      const isImageFile = file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);

      if (!isImageFile) {
        continue;
      }

      try {
        const optimizedDataUrl = await optimizeImageFile(file, 1400, 0.80);
        newImages.push(optimizedDataUrl);
      } catch (err) {
        console.error('Error reading/optimizing file:', file.name, err);
      }
    }

    if (newImages.length === 0) {
      setErrorMsg('업로드 가능한 이미지/GIF 파일이 없습니다.');
    } else {
      onChange([...images, ...newImages]);
    }
    setIsProcessing(false);
  };

  const handleSingleReplace = async (file: File) => {
    if (replacingIndex === null) return;
    setIsProcessing(true);
    try {
      const optimizedDataUrl = await optimizeImageFile(file, 1400, 0.80);
      const updated = [...images];
      updated[replacingIndex] = optimizedDataUrl;
      onChange(updated);
    } catch (err) {
      console.error('Image replace error:', err);
    } finally {
      setIsProcessing(false);
      setReplacingIndex(null);
    }
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onChange(updated);
  };

  const moveDown = (index: number) => {
    if (index >= images.length - 1) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onChange(updated);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3 w-full bg-[#1A1A18] p-3.5 rounded-xl border border-[#3A3A36]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#2C2C28]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-bold font-mono text-white">{label}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-950/70 text-pink-300 border border-pink-800">
            총 {images.length}장 컷팅 등록됨
          </span>
        </div>

        {/* Layout Mode Selector */}
        {onLayoutModeChange && (
          <div className="flex items-center gap-1 bg-[#252522] p-1 rounded-lg border border-[#3A3A36]">
            <button
              type="button"
              onClick={() => onLayoutModeChange('seamless')}
              className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                layoutMode === 'seamless'
                  ? 'bg-pink-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="상세페이지 컷팅들을 여백 없이 세로로 무봉제 결합"
            >
              무봉제 연속 연결
            </button>
            <button
              type="button"
              onClick={() => onLayoutModeChange('spaced')}
              className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                layoutMode === 'spaced'
                  ? 'bg-pink-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="컷팅별 카드 여백 분할"
            >
              간격 분할
            </button>
            <button
              type="button"
              onClick={() => onLayoutModeChange('grid')}
              className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                layoutMode === 'grid'
                  ? 'bg-pink-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="2열 그리드 배치"
            >
              2열 그리드
            </button>
            <button
              type="button"
              onClick={() => onLayoutModeChange('slide')}
              className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                layoutMode === 'slide' || layoutMode === 'carousel'
                  ? 'bg-pink-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="옆으로 넘기는 가로 슬라이더 / 캐러셀"
            >
              가로 슬라이드
            </button>
          </div>
        )}
      </div>

      {/* Hidden Multi-file Input */}
      <input
        ref={multiInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={(e) => {
          if (e.target.files) processFiles(e.target.files);
        }}
        className="hidden"
      />

      {/* Hidden Single Replace Input */}
      <input
        ref={singleReplaceRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleSingleReplace(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Current Slices List */}
      {images.length > 0 && (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {images.map((imgUrl, idx) => {
            const isGif = isGifMedia(imgUrl);
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-2 rounded-lg bg-[#242422] border border-[#333330] hover:border-[#4E4E48] transition-colors"
              >
                {/* Index tag & Drag order badge */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-6 h-6 rounded bg-[#333330] text-slate-200 text-xs font-mono font-bold flex items-center justify-center">
                    #{idx + 1}
                  </span>
                </div>

                {/* Thumbnail */}
                <div className="w-16 h-14 rounded bg-[#161614] border border-[#3A3A36] overflow-hidden shrink-0 relative flex items-center justify-center">
                  <img
                    src={imgUrl}
                    alt={`Cut ${idx + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                  {isGif && (
                    <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-pink-600 text-white text-[8px] font-mono font-bold">
                      GIF
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white font-mono">
                      컷 #{idx + 1}
                    </span>
                    {isGif && (
                      <span className="text-[10px] text-pink-400 font-mono flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> 움직이는 GIF
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 truncate">
                    {imgUrl.startsWith('data:image/gif') ? '로컬 GIF 애니메이션 파일' : imgUrl.startsWith('data:') ? '로컬 이미지 파일' : imgUrl}
                  </p>
                </div>

                {/* Actions: Move Up, Move Down, Replace, Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 rounded bg-[#2E2E2A] hover:bg-[#3D3D38] text-slate-300 disabled:opacity-30 transition-colors"
                    title="위로 이동"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(idx)}
                    disabled={idx === images.length - 1}
                    className="p-1.5 rounded bg-[#2E2E2A] hover:bg-[#3D3D38] text-slate-300 disabled:opacity-30 transition-colors"
                    title="아래로 이동"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplacingIndex(idx);
                      if (singleReplaceRef.current) {
                        singleReplaceRef.current.value = '';
                        singleReplaceRef.current.click();
                      }
                    }}
                    className="px-2 py-1 rounded bg-[#2E2E2A] hover:bg-[#3D3D38] text-[11px] font-mono text-slate-300 border border-[#3F3F3A]"
                    title="이 컷만 다른 파일로 교체"
                  >
                    교체
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="p-1.5 rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900/50 transition-colors"
                    title="이 컷 삭제"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multi-Dropzone Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => {
          if (multiInputRef.current) {
            multiInputRef.current.value = '';
            multiInputRef.current.click();
          }
        }}
        className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
          isDragging
            ? 'border-pink-400 bg-pink-400/10'
            : 'border-[#40403C] hover:border-pink-400/60 bg-[#222220] hover:bg-[#262624]'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-[#2E2E2A] border border-[#444440] flex items-center justify-center text-pink-400 shadow-sm">
          {isProcessing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </div>

        <div className="space-y-0.5">
          <p className="text-xs font-bold text-white flex items-center justify-center gap-1">
            <span>여러 장의 컷팅 이미지/GIF 한 번에 추가</span>
            <span className="text-[10px] text-pink-400 font-mono font-normal">(다중 선택/드래그 지원)</span>
          </p>
          <p className="text-[11px] text-[#888880]">
            상세페이지 1번~N번 컷 이미지 및 GIF를 드래그하여 순서대로 넣을 수 있습니다.
          </p>
        </div>
      </div>

      {errorMsg && (
        <p className="text-[11px] text-red-400 font-mono bg-red-950/30 p-2 rounded border border-red-900/50">
          {errorMsg}
        </p>
      )}
    </div>
  );
};
