import React, { useState, useRef, useEffect } from 'react';
import { ArmPosition } from '../../context/UserContext';

interface DraggableArmProps {
  armType: 'leftArm' | 'rightArm';
  children: React.ReactNode;
  initialPosition: ArmPosition;
  onPositionChange: (position: ArmPosition) => void;
  isEditable?: boolean;
  onEditRequest?: () => void; // Callback when arm is clicked in non-editable mode
}

const DraggableArm: React.FC<DraggableArmProps> = ({
  armType,
  children,
  initialPosition,
  onPositionChange,
  isEditable = true,
  onEditRequest
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
    e.preventDefault();
    e.stopPropagation();
    
    const coords = getEventCoordinates(e.nativeEvent);
    setIsDragging(true);
    setDragStart({
      x: coords.x,
      y: coords.y,
      rotation: currentPosition.rotation
    });
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragStart || !containerRef.current) return;

    const coords = getEventCoordinates(e);
    const parentContainer = containerRef.current.parentElement;
    if (!parentContainer) return;

    const parentRect = parentContainer.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerCenterX = containerRect.left + containerRect.width / 2;
    const containerCenterY = containerRect.top + containerRect.height / 2;

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
    // For a typical 200px container, 1% = 2px, so delta / 2 = percentage change
    const topDelta = (deltaY / parentHeight) * 100;
    const horizontalDelta = (deltaX / parentWidth) * 100;
    
    // Calculate new positions with bounds
    const newTop = Math.max(0, Math.min(100, currentTop + topDelta));
    const newHorizontal = currentHorizontal + horizontalDelta;

    // Improved rotation calculation: allow full 360° rotation including perpendicular (90°)
    // Use a combination of position and rotation adjustment
    // Horizontal drag adjusts position, vertical drag adjusts rotation
    // Or use circular drag motion for rotation
    
    // Calculate distance and angle from drag start
    const distanceFromStart = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const dragAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    // Use Alt key or Shift key to toggle between position and rotation modes
    // For now, use a hybrid approach: small movements adjust position, larger circular movements adjust rotation
    let newRotation = currentPosition.rotation;
    
    // If dragging in a more circular pattern (perpendicular component is significant), adjust rotation
    // Calculate perpendicular component of drag
    const perpendicularComponent = Math.abs(deltaX) < Math.abs(deltaY) ? deltaY : deltaX;
    
    // Adjust rotation based on drag - allow full range including 90° (perpendicular)
    // Use a sensitivity factor to make rotation feel natural
    const rotationSensitivity = 0.8; // Adjust this to make rotation more/less sensitive
    const rotationDelta = (deltaX * rotationSensitivity) - (deltaY * rotationSensitivity * 0.5);
    newRotation = dragStart.rotation + rotationDelta;
    
    // Allow full 360° rotation - no limits
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
  }, [isDragging]);

  const style: React.CSSProperties = {
    top: currentPosition.top,
    [armType === 'leftArm' ? 'right' : 'left']: currentPosition.horizontal,
    width: currentPosition.width || '65%',
    height: currentPosition.height || '80%',
    transform: `translateY(-50%) rotate(${currentPosition.rotation}deg)`,
    transformOrigin: currentPosition.transformOrigin,
    cursor: isEditable ? (isDragging ? 'grabbing' : 'grab') : (isHovering ? 'pointer' : 'default'),
    opacity: isDragging ? 0.8 : 1,
    border: isDragging ? '3px solid #FFD700' : (isHovering && !isEditable ? '2px dashed #FFD700' : undefined),
    boxShadow: isDragging ? '0 0 15px rgba(255, 215, 0, 0.6)' : (isHovering && !isEditable ? '0 0 10px rgba(255, 215, 0, 0.4)' : undefined),
    transition: isDragging ? 'none' : 'opacity 0.2s, border 0.2s, box-shadow 0.2s',
    zIndex: isDragging ? 50 : 20,
  };

  return (
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
    </div>
  );
};

export default DraggableArm;

