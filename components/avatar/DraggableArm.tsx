import React, { useState, useRef, useEffect } from 'react';
import { ArmPosition } from '../../context/UserContext';

interface DraggableArmProps {
  armType: 'leftArm' | 'rightArm';
  children: React.ReactNode;
  initialPosition: ArmPosition;
  onPositionChange: (position: ArmPosition) => void;
  isEditable?: boolean;
  onEditRequest?: () => void; // Callback when arm is clicked in non-editable mode
  isSelected?: boolean; // Whether this arm is currently selected for rotation controls
  onSelect?: () => void; // Callback when arm is clicked to select it
  onRotate?: (angle: number) => void; // Callback to rotate the arm by a specific angle
}

const DraggableArm: React.FC<DraggableArmProps> = ({
  armType,
  children,
  initialPosition,
  onPositionChange,
  isEditable = true,
  onEditRequest,
  isSelected = false,
  onSelect,
  onRotate
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<ArmPosition>(initialPosition);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; rotation: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update position when initialPosition changes externally
  useEffect(() => {
    setCurrentPosition(initialPosition);
  }, [initialPosition]);

  const getEventCoordinates = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditable) {
      // If not editable, request edit mode
      if (onEditRequest) {
        e.preventDefault();
        e.stopPropagation();
        onEditRequest();
      }
      return;
    }
    
    const coords = getEventCoordinates(e.nativeEvent);
    const startTime = Date.now();
    const startX = coords.x;
    const startY = coords.y;
    
    // Track if this becomes a drag or a click
    let isClick = true;
    
    const handleMoveCheck = (moveEvent: MouseEvent | TouchEvent) => {
      const moveCoords = getEventCoordinates(moveEvent);
      const moved = Math.abs(moveCoords.x - startX) > 5 || Math.abs(moveCoords.y - startY) > 5;
      if (moved) {
        isClick = false;
        // Start dragging
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setDragStart({
          x: startX,
          y: startY,
          rotation: currentPosition.rotation
        });
        window.removeEventListener('mousemove', handleMoveCheck);
        window.removeEventListener('touchmove', handleMoveCheck);
      }
    };
    
    const handleEndCheck = () => {
      const timeDiff = Date.now() - startTime;
      window.removeEventListener('mousemove', handleMoveCheck);
      window.removeEventListener('touchmove', handleMoveCheck);
      window.removeEventListener('mouseup', handleEndCheck);
      window.removeEventListener('touchend', handleEndCheck);
      
      if (isClick && timeDiff < 200 && onSelect) {
        // It's a click - select the arm
        e.preventDefault();
        e.stopPropagation();
        onSelect();
      }
    };
    
    window.addEventListener('mousemove', handleMoveCheck);
    window.addEventListener('touchmove', handleMoveCheck);
    window.addEventListener('mouseup', handleEndCheck);
    window.addEventListener('touchend', handleEndCheck);
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragStart || !containerRef.current) return;

    const coords = getEventCoordinates(e);
    const parentContainer = containerRef.current.parentElement;
    if (!parentContainer) return;

    const parentRect = parentContainer.getBoundingClientRect();
    
    // Calculate drag delta in pixels
    const deltaX = coords.x - dragStart.x;
    const deltaY = coords.y - dragStart.y;

    // Get parent container dimensions for percentage calculations
    const parentWidth = parentRect.width || 1;
    const parentHeight = parentRect.height || 1;
    
    // Parse current position percentages
    const currentTop = parseFloat(currentPosition.top) || 50;
    const currentHorizontal = parseFloat(currentPosition.horizontal) || (armType === 'leftArm' ? -40 : -40);
    
    // Convert pixel deltas to percentage changes
    const topDelta = (deltaY / parentHeight) * 100;
    const horizontalDelta = (deltaX / parentWidth) * 100;
    
    // Calculate new positions with bounds
    const newTop = Math.max(0, Math.min(100, currentTop + topDelta));
    const newHorizontal = currentHorizontal + horizontalDelta;

    // Improved rotation calculation: allow full 360° rotation
    const rotationSensitivity = 0.8;
    const rotationDelta = (deltaX * rotationSensitivity) - (deltaY * rotationSensitivity * 0.5);
    let newRotation = dragStart.rotation + rotationDelta;
    
    // Normalize to -180 to 180 for consistency
    while (newRotation > 180) newRotation -= 360;
    while (newRotation < -180) newRotation += 360;

    const newPosition: ArmPosition = {
      ...currentPosition,
      top: `${newTop}%`,
      horizontal: `${newHorizontal}%`,
      rotation: newRotation
    };

    setCurrentPosition(newPosition);
  };

  const handleEnd = () => {
    if (isDragging && currentPosition) {
      onPositionChange(currentPosition);
    }
    setIsDragging(false);
    setDragStart(null);
  };

  // Global mouse/touch event handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragStart) {
        handleMove(e);
      }
    };
    const handleMouseUp = () => {
      if (isDragging) {
        handleEnd();
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && dragStart) {
        handleMove(e);
      }
    };
    const handleTouchEnd = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, dragStart, currentPosition, armType]);

  // Preset rotation angles
  const rotationAngles = [-90, -45, 0, 45, 90, 135, 180];

  const handleRotateClick = (angle: number) => {
    if (onRotate) {
      onRotate(angle);
    }
  };

  const style: React.CSSProperties = {
    top: currentPosition.top,
    [armType === 'leftArm' ? 'right' : 'left']: currentPosition.horizontal,
    width: currentPosition.width || '65%',
    height: currentPosition.height || '80%',
    transform: `translateY(-50%) rotate(${currentPosition.rotation}deg)`,
    transformOrigin: currentPosition.transformOrigin,
    cursor: isEditable ? (isDragging ? 'grabbing' : 'grab') : (isHovering ? 'pointer' : 'default'),
    opacity: isDragging ? 0.8 : 1,
    border: isSelected ? '3px solid #FFD700' : (isDragging ? '3px solid #FFD700' : (isHovering && !isEditable ? '2px dashed #FFD700' : undefined)),
    boxShadow: isSelected ? '0 0 20px rgba(255, 215, 0, 0.8)' : (isDragging ? '0 0 15px rgba(255, 215, 0, 0.6)' : (isHovering && !isEditable ? '0 0 10px rgba(255, 215, 0, 0.4)' : undefined)),
    transition: isDragging ? 'none' : 'opacity 0.2s, border 0.2s, box-shadow 0.2s',
    zIndex: isSelected ? 50 : (isDragging ? 50 : 20),
  };

  return (
    <>
      <div
        ref={containerRef}
        style={style}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="absolute rounded-xl select-none"
      >
        {children}
        {isEditable && isDragging && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#FFD700] rounded-full border-2 border-white shadow-lg animate-pulse" />
        )}
        {!isEditable && isHovering && onEditRequest && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
            Click to edit
          </div>
        )}
        {isSelected && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-[#FFD700] text-[#8B4513] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap z-50 pointer-events-none">
            SELECTED
          </div>
        )}
      </div>
      
      {/* Rotation Buttons - Appear when arm is selected */}
      {isSelected && isEditable && onRotate && (
        <div 
          className="absolute z-[60] flex flex-col gap-1 bg-black/80 backdrop-blur-sm rounded-lg p-2 shadow-xl border-2 border-[#FFD700]"
          style={{
            [armType === 'leftArm' ? 'right' : 'left']: 'calc(100% + 10px)',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[#FFD700] text-[8px] font-bold text-center mb-1 px-1">ROTATE</div>
          {rotationAngles.map((angle) => (
            <button
              key={angle}
              onClick={(e) => {
                e.stopPropagation();
                handleRotateClick(angle);
              }}
              className="w-8 h-8 bg-[#FFD700] hover:bg-[#ffed4e] text-[#8B4513] rounded-md flex items-center justify-center font-bold text-xs transition-all active:scale-95 shadow-md border border-[#B8860B]"
              title={`Rotate to ${angle}°`}
            >
              {angle}°
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default DraggableArm;
