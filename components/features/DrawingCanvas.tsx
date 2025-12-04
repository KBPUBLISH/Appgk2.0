import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser, RotateCcw, Download, Paintbrush, Highlighter, PenTool, Pencil, Hand } from 'lucide-react';

interface DrawingCanvasProps {
    prompt: string;
    backgroundImageUrl?: string;
    onComplete?: () => void;
}

// Brush types with their properties
type BrushType = 'paintbrush' | 'marker' | 'crayon' | 'pencil';

interface BrushConfig {
    name: string;
    icon: React.ReactNode;
    minSize: number;
    maxSize: number;
    defaultSize: number;
    opacity: number;
    texture: 'smooth' | 'soft' | 'rough' | 'fine';
    cursorImage: string;
    // Offset from cursor to tip of the tool (in pixels)
    // Positive Y means tip is below the cursor anchor point
    tipOffsetX: number;
    tipOffsetY: number;
}

const BRUSH_CONFIGS: Record<BrushType, BrushConfig> = {
    paintbrush: {
        name: 'Paintbrush',
        icon: <Paintbrush className="w-5 h-5" />,
        minSize: 8,
        maxSize: 35,
        defaultSize: 15,
        opacity: 0.9,
        texture: 'smooth',
        cursorImage: '🖌️',
        tipOffsetX: -20,  // Tip is to the bottom-left
        tipOffsetY: 35,
    },
    marker: {
        name: 'Marker',
        icon: <Highlighter className="w-5 h-5" />,
        minSize: 15,
        maxSize: 45,
        defaultSize: 28,
        opacity: 0.5,
        texture: 'soft',
        cursorImage: '🖍️',
        tipOffsetX: -18,
        tipOffsetY: 38,
    },
    crayon: {
        name: 'Crayon',
        icon: <PenTool className="w-5 h-5" />,
        minSize: 10,
        maxSize: 30,
        defaultSize: 18,
        opacity: 0.85,
        texture: 'rough',
        cursorImage: '🖍️',
        tipOffsetX: -18,
        tipOffsetY: 38,
    },
    pencil: {
        name: 'Pencil',
        icon: <Pencil className="w-5 h-5" />,
        minSize: 4,
        maxSize: 15,
        defaultSize: 8,
        opacity: 1,
        texture: 'fine',
        cursorImage: '✏️',
        tipOffsetX: -22,
        tipOffsetY: 40,
    },
};

const CRAYON_COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky Blue
    '#F8B739', // Orange
    '#52BE80', // Green
    '#E74C3C', // Dark Red
    '#8E44AD', // Dark Purple
    '#000000', // Black
    '#FFFFFF', // White
];

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ prompt, backgroundImageUrl, onComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedColor, setSelectedColor] = useState(CRAYON_COLORS[0]);
    const [brushType, setBrushType] = useState<BrushType>('paintbrush');
    const [brushSize, setBrushSize] = useState(BRUSH_CONFIGS.paintbrush.defaultSize);
    const [isEraser, setIsEraser] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isLeftHanded, setIsLeftHanded] = useState(false);

    // Visual cursor position
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
    const [showCursor, setShowCursor] = useState(false);

    // Track if canvas has been initialized
    const [canvasReady, setCanvasReady] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Store last position for smooth drawing
    const lastPosRef = useRef<{ x: number; y: number } | null>(null);

    // Get current brush config
    const currentBrush = BRUSH_CONFIGS[brushType];

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            // Set actual size in memory (scaled for device pixel ratio)
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            // Scale the drawing context to account for device pixel ratio
            ctx.scale(dpr, dpr);

            // Set display size (CSS pixels)
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';

            // Fill with white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, rect.width, rect.height);
        };

        resizeCanvas();
        setCanvasReady(true);

        // Handle window resize
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    // Load background image when URL changes or canvas is ready
    useEffect(() => {
        if (!canvasReady || !backgroundImageUrl) {
            console.log('🎨 DrawingCanvas: Waiting for canvas or no image URL', { canvasReady, backgroundImageUrl });
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        console.log('🎨 DrawingCanvas: Loading background image:', backgroundImageUrl);

        const img = new Image();
        // Don't use crossOrigin for GCS images - it triggers CORS requirements
        // The canvas will be "tainted" but that's fine for coloring (no export needed)

        img.onload = () => {
            console.log('🎨 DrawingCanvas: Image loaded successfully!', { width: img.width, height: img.height });
            const dpr = window.devicePixelRatio || 1;
            const canvasWidth = canvas.width / dpr;
            const canvasHeight = canvas.height / dpr;

            // Clear canvas and redraw white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // Calculate aspect ratio to fit image within canvas
            const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
            const x = (canvasWidth / 2) - (img.width / 2) * scale;
            const y = (canvasHeight / 2) - (img.height / 2) * scale;

            try {
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                setImageLoaded(true);
            } catch (e) {
                console.error('🎨 DrawingCanvas: Error drawing image to canvas (likely CORS):', e);
            }
        };

        img.onerror = (err) => {
            console.error('🎨 DrawingCanvas: Failed to load image:', backgroundImageUrl, err);
        };

        img.src = backgroundImageUrl;
    }, [canvasReady, backgroundImageUrl]);

    // Apply brush-specific stroke style
    const applyBrushStyle = useCallback((ctx: CanvasRenderingContext2D, brush: BrushConfig) => {
        ctx.globalAlpha = brush.opacity;

        switch (brush.texture) {
            case 'smooth':
                // Paintbrush - smooth, flowing strokes
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                break;
            case 'soft':
                // Marker - chisel tip effect
                ctx.lineCap = 'square';
                ctx.lineJoin = 'round';
                break;
            case 'rough':
                // Crayon - slightly rough edges
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                break;
            case 'fine':
                // Pencil - precise thin lines
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                break;
        }
    }, []);

    // Draw with texture effect for crayon
    const drawWithTexture = useCallback((
        ctx: CanvasRenderingContext2D,
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
        brush: BrushConfig,
        size: number,
        color: string
    ) => {
        if (brush.texture === 'rough') {
            // Crayon effect - draw multiple offset lines for texture
            const distance = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
            const steps = Math.max(Math.floor(distance / 2), 1);

            for (let i = 0; i < steps; i++) {
                const t = i / steps;
                const x = fromX + (toX - fromX) * t;
                const y = fromY + (toY - fromY) * t;

                // Add slight random offset for texture
                const jitter = size * 0.15;
                const offsetX = (Math.random() - 0.5) * jitter;
                const offsetY = (Math.random() - 0.5) * jitter;

                ctx.beginPath();
                ctx.arc(x + offsetX, y + offsetY, size / 2 * (0.8 + Math.random() * 0.4), 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            }
        } else if (brush.texture === 'soft') {
            // Marker effect - multiple transparent overlapping circles
            const distance = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
            const steps = Math.max(Math.floor(distance / 3), 1);

            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const x = fromX + (toX - fromX) * t;
                const y = fromY + (toY - fromY) * t;

                ctx.beginPath();
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            }
        } else {
            // Standard line drawing for smooth brushes
            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(toX, toY);
            ctx.stroke();
        }
    }, []);

    const getCoordinates = useCallback((e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        // Handle both React synthetic events and native DOM events
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        // Since we scaled the context by devicePixelRatio, coordinates should be in CSS pixels
        // which is what we get from getBoundingClientRect
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    }, []);

    const startDrawing = useCallback((e: any) => {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoordinates(e);
        lastPosRef.current = { x, y };

        setIsDrawing(true);
        setShowCursor(true);

        if (isEraser) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.globalAlpha = 1;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            applyBrushStyle(ctx, currentBrush);
            ctx.strokeStyle = selectedColor;
        }
        ctx.lineWidth = brushSize;

        // Draw a dot at start position
        if (!isEraser && currentBrush.texture !== 'smooth' && currentBrush.texture !== 'fine') {
            ctx.beginPath();
            ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = selectedColor;
            ctx.fill();
        }
    }, [getCoordinates, isEraser, currentBrush, selectedColor, brushSize, applyBrushStyle]);

    const draw = useCallback((e: any) => {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();

        const { x, y } = getCoordinates(e);

        // Update cursor position for visual feedback
        setCursorPos({ x, y });

        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const lastPos = lastPosRef.current || { x, y };

        if (isEraser) {
            ctx.beginPath();
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        } else {
            drawWithTexture(ctx, lastPos.x, lastPos.y, x, y, currentBrush, brushSize, selectedColor);
        }

        lastPosRef.current = { x, y };
    }, [getCoordinates, isDrawing, isEraser, currentBrush, brushSize, selectedColor, drawWithTexture]);

    const stopDrawing = useCallback(() => {
        if (isDrawing) {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.globalAlpha = 1;
                }
            }
            setIsDrawing(false);
            lastPosRef.current = null;
        }
    }, [isDrawing]);

    const handleMouseEnter = useCallback(() => {
        setShowCursor(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setShowCursor(false);
        setCursorPos(null);
        stopDrawing();
    }, [stopDrawing]);

    // Add non-passive event listeners for touch to prevent scrolling while drawing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleTouchStart = (e: TouchEvent) => startDrawing(e as any);
        const handleTouchMove = (e: TouchEvent) => draw(e as any);
        const handleTouchEnd = () => stopDrawing();

        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);

        return () => {
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
        };
    }, [startDrawing, draw, stopDrawing]);

    // Update brush size when brush type changes
    useEffect(() => {
        setBrushSize(currentBrush.defaultSize);
    }, [brushType, currentBrush.defaultSize]);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const canvasWidth = canvas.width / dpr;
        const canvasHeight = canvas.height / dpr;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Redraw background image if provided
        if (backgroundImageUrl) {
            const img = new Image();
            img.src = backgroundImageUrl;
            img.onload = () => {
                const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
                const x = (canvasWidth / 2) - (img.width / 2) * scale;
                const y = (canvasHeight / 2) - (img.height / 2) * scale;

                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            };
        }
    };

    const downloadDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = 'my-drawing.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Prompt */}
            <div className="mb-2 p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-white text-sm md:text-base font-semibold">{prompt}</p>
            </div>

            {/* Canvas Container */}
            <div
                ref={containerRef}
                className="flex-1 bg-white rounded-lg overflow-hidden shadow-lg mb-2 relative min-h-0"
            >
                <canvas
                    ref={canvasRef}
                    className="w-full h-full touch-none"
                    style={{ minHeight: '250px', cursor: 'none' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                />

                {/* Visual Brush Cursor - Positioned so TIP is at drawing point */}
                {showCursor && cursorPos && (
                    <div
                        className="pointer-events-none absolute z-50"
                        style={{
                            // Position the cursor container so the TOOL TIP is at cursorPos
                            // For left-handed: mirror the X offset
                            left: cursorPos.x - (isLeftHanded ? -currentBrush.tipOffsetX : currentBrush.tipOffsetX),
                            top: cursorPos.y - currentBrush.tipOffsetY,
                            transition: 'left 0.02s linear, top 0.02s linear',
                        }}
                    >
                        <div className="relative">
                            {/* Tool image with high visibility */}
                            <div
                                className="relative"
                                style={{
                                    // Mirror horizontally for left-handed users
                                    transform: `${isLeftHanded ? 'scaleX(-1)' : ''} ${isDrawing ? 'scale(1.05) rotate(-3deg)' : 'scale(1)'}`,
                                    transition: 'transform 0.1s ease-out',
                                }}
                            >
                                {/* Large visible brush/tool - SVG version for color control */}
                                {isEraser ? (
                                    <span
                                        className="text-5xl md:text-6xl select-none"
                                        style={{
                                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))',
                                            display: 'block',
                                        }}
                                    >
                                        🧽
                                    </span>
                                ) : (
                                    <div className="relative">
                                        {/* Colored tool body */}
                                        <svg
                                            viewBox="0 0 64 64"
                                            className="w-14 h-14 md:w-16 md:h-16"
                                            style={{
                                                filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.5))',
                                            }}
                                        >
                                            {brushType === 'paintbrush' && (
                                                <>
                                                    {/* Brush handle */}
                                                    <rect x="28" y="4" width="8" height="30" rx="2" fill="#8B4513" />
                                                    <rect x="30" y="4" width="2" height="30" fill="#A0522D" />
                                                    {/* Ferrule (metal part) */}
                                                    <rect x="26" y="32" width="12" height="6" rx="1" fill="#C0C0C0" />
                                                    <rect x="26" y="33" width="12" height="2" fill="#E8E8E8" />
                                                    {/* Bristles - colored */}
                                                    <path
                                                        d="M26 38 Q24 48 28 58 L32 60 L36 58 Q40 48 38 38 Z"
                                                        fill={selectedColor}
                                                    />
                                                    <path
                                                        d="M28 38 Q27 46 29 54 L32 56 L35 54 Q37 46 36 38 Z"
                                                        fill={selectedColor}
                                                        opacity="0.7"
                                                    />
                                                </>
                                            )}
                                            {brushType === 'marker' && (
                                                <>
                                                    {/* Marker body */}
                                                    <rect x="24" y="4" width="16" height="36" rx="3" fill={selectedColor} />
                                                    <rect x="26" y="4" width="4" height="36" fill="white" opacity="0.3" />
                                                    {/* Cap ring */}
                                                    <rect x="23" y="38" width="18" height="4" rx="1" fill="#333" />
                                                    {/* Tip */}
                                                    <path
                                                        d="M26 42 L32 60 L38 42 Z"
                                                        fill={selectedColor}
                                                    />
                                                    <path
                                                        d="M29 42 L32 55 L35 42 Z"
                                                        fill="white"
                                                        opacity="0.2"
                                                    />
                                                </>
                                            )}
                                            {brushType === 'crayon' && (
                                                <>
                                                    {/* Crayon body */}
                                                    <rect x="25" y="8" width="14" height="32" rx="2" fill={selectedColor} />
                                                    {/* Paper wrapper */}
                                                    <rect x="25" y="12" width="14" height="20" fill="#222" opacity="0.15" />
                                                    <text x="32" y="25" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" opacity="0.8">
                                                        ★
                                                    </text>
                                                    {/* Highlight */}
                                                    <rect x="27" y="8" width="3" height="32" fill="white" opacity="0.25" />
                                                    {/* Tip */}
                                                    <path
                                                        d="M25 40 L32 58 L39 40 Z"
                                                        fill={selectedColor}
                                                    />
                                                    <path
                                                        d="M28 40 L32 52 L36 40 Z"
                                                        fill="white"
                                                        opacity="0.2"
                                                    />
                                                </>
                                            )}
                                            {brushType === 'pencil' && (
                                                <>
                                                    {/* Pencil body */}
                                                    <rect x="27" y="4" width="10" height="34" fill={selectedColor} />
                                                    {/* Highlight stripe */}
                                                    <rect x="29" y="4" width="3" height="34" fill="white" opacity="0.3" />
                                                    {/* Wood tip */}
                                                    <path
                                                        d="M27 38 L32 54 L37 38 Z"
                                                        fill="#DEB887"
                                                    />
                                                    {/* Graphite tip */}
                                                    <path
                                                        d="M30 48 L32 58 L34 48 Z"
                                                        fill="#333"
                                                    />
                                                    {/* Eraser */}
                                                    <rect x="27" y="2" width="10" height="5" rx="1" fill="#FFB6C1" />
                                                    {/* Metal band */}
                                                    <rect x="26" y="5" width="12" height="3" fill="#C0C0C0" />
                                                </>
                                            )}
                                        </svg>
                                    </div>
                                )}
                                
                                {/* Colored glow at the tip to show where drawing happens */}
                                {!isEraser && (
                                    <div
                                        className="absolute rounded-full animate-pulse"
                                        style={{
                                            // Position at the tip - adjusted for SVG size
                                            left: isLeftHanded ? 'auto' : currentBrush.tipOffsetX + 28,
                                            right: isLeftHanded ? currentBrush.tipOffsetX + 28 : 'auto',
                                            top: currentBrush.tipOffsetY,
                                            width: Math.max(10, brushSize * 0.7),
                                            height: Math.max(10, brushSize * 0.7),
                                            backgroundColor: selectedColor,
                                            boxShadow: `0 0 ${brushSize}px ${selectedColor}, 0 0 ${brushSize * 2}px ${selectedColor}50`,
                                            transform: 'translate(-50%, -50%)',
                                            opacity: isDrawing ? 1 : 0.7,
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Brush Type Selector */}
            <div className="mb-2">
                <div className="flex justify-center gap-2">
                    {(Object.entries(BRUSH_CONFIGS) as [BrushType, BrushConfig][]).map(([type, config]) => (
                        <button
                            key={type}
                            onClick={() => {
                                setBrushType(type);
                                setIsEraser(false);
                            }}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${brushType === type && !isEraser
                                ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-black shadow-lg scale-105'
                                : 'bg-white/15 text-white hover:bg-white/25'
                                }`}
                            title={config.name}
                        >
                            {config.icon}
                            <span className="text-[10px] font-medium">{config.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Crayon Palette */}
            <div className="mb-2">
                <div className="flex flex-wrap gap-1.5 justify-center">
                    {CRAYON_COLORS.map((color) => (
                        <button
                            key={color}
                            onClick={() => {
                                setSelectedColor(color);
                                setIsEraser(false);
                            }}
                            className={`w-7 h-7 md:w-8 md:h-8 rounded-full transition-all ${selectedColor === color && !isEraser
                                ? 'ring-2 ring-[#FFD700] ring-offset-2 ring-offset-purple-900 scale-110 shadow-lg'
                                : 'hover:scale-105 shadow-md'
                                }`}
                            style={{
                                backgroundColor: color,
                                border: color === '#FFFFFF' ? '2px solid #ccc' : 'none',
                            }}
                            title={color}
                        />
                    ))}
                </div>
            </div>

            {/* Tools Row */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Left/Right Hand Toggle */}
                <button
                    onClick={() => setIsLeftHanded(!isLeftHanded)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-xs font-medium ${
                        isLeftHanded
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                            : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                    title={isLeftHanded ? 'Left-handed mode' : 'Right-handed mode'}
                >
                    <Hand 
                        className="w-4 h-4" 
                        style={{ transform: isLeftHanded ? 'scaleX(-1)' : 'none' }}
                    />
                    <span>{isLeftHanded ? 'L' : 'R'}</span>
                </button>

                {/* Brush Size */}
                <div className="flex items-center gap-2 flex-1 min-w-[80px]">
                    <span className="text-white/70 text-xs">Size:</span>
                    <input
                        type="range"
                        min={currentBrush.minSize}
                        max={currentBrush.maxSize}
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="flex-1 accent-[#FFD700]"
                    />
                    <div
                        className="rounded-full"
                        style={{
                            width: Math.max(8, brushSize / 2),
                            height: Math.max(8, brushSize / 2),
                            backgroundColor: selectedColor,
                            border: selectedColor === '#FFFFFF' ? '1px solid #ccc' : 'none',
                        }}
                    />
                </div>

                {/* Tool Buttons */}
                <div className="flex items-center gap-1.5">
                    {/* Eraser */}
                    <button
                        onClick={() => setIsEraser(!isEraser)}
                        className={`p-2 rounded-lg transition-all ${isEraser
                            ? 'bg-[#FFD700] text-black shadow-lg'
                            : 'bg-white/15 text-white hover:bg-white/25'
                            }`}
                        title="Eraser"
                    >
                        <Eraser className="w-4 h-4 md:w-5 md:h-5" />
                    </button>

                    {/* Clear */}
                    <button
                        onClick={clearCanvas}
                        className="p-2 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-all"
                        title="Start Over"
                    >
                        <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                    </button>

                    {/* Download */}
                    <button
                        onClick={downloadDrawing}
                        className="p-2 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-all"
                        title="Save Drawing"
                    >
                        <Download className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>
            </div>

            {/* Complete Button */}
            {!isCompleted && onComplete && (
                <button
                    onClick={() => {
                        setIsCompleted(true);
                        onComplete();
                    }}
                    className="mt-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black px-6 py-3 rounded-xl font-bold w-full hover:shadow-lg hover:scale-[1.02] transition-all active:scale-95"
                >
                    🎨 I'm Done Coloring!
                </button>
            )}

            {/* Completion Message */}
            {isCompleted && (
                <div className="mt-3 bg-green-500/20 backdrop-blur-sm border-2 border-green-400 rounded-xl p-3 text-center animate-in fade-in zoom-in duration-300">
                    <p className="text-white font-bold text-lg mb-1">🌟 Amazing Artwork!</p>
                    <p className="text-white/80 text-sm">You did a wonderful job!</p>
                </div>
            )}
        </div>
    );
};

export default DrawingCanvas;
