import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw } from 'lucide-react';

interface BookViewer3DProps {
  bookTitle: string;
  bookCover?: string; // URL to the book cover image
  className?: string;
}

export function BookViewer3D({ bookTitle, bookCover, className = '' }: BookViewer3DProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  
  // Three.js scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bookRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number | null>(null);
  
  // Mouse interaction state
  const mouseRef = useRef<{ x: number, y: number, isDown: boolean }>({
    x: 0,
    y: 0,
    isDown: false
  });

  useEffect(() => {
    // Early exit if containerRef is null
    if (!containerRef.current) return;
    
    // Initialize the 3D scene
    const init = async () => {
      try {
        const container = containerRef.current;
        if (!container) return;
        
        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0xf5f5f5);
        
        // Camera setup
        const camera = new THREE.PerspectiveCamera(
          50, 
          container.clientWidth / container.clientHeight, 
          0.1, 
          1000
        );
        cameraRef.current = camera;
        camera.position.z = 5;
        
        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current = renderer;
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        // Create book
        await createBook(scene, bookCover);
        
        // Start the animation loop
        animate();
        
        setIsLoading(false);
        
        // Handle resize
        window.addEventListener('resize', handleResize);
        
        // Event listeners for user interaction
        if (containerRef.current) {
          containerRef.current.addEventListener('mousedown', handleMouseDown);
          window.addEventListener('mouseup', handleMouseUp);
          window.addEventListener('mousemove', handleMouseMove);
          
          // Touch events
          containerRef.current.addEventListener('touchstart', handleTouchStart);
          window.addEventListener('touchend', handleTouchEnd);
          window.addEventListener('touchmove', handleTouchMove);
        }
        
        return () => {
          // Cleanup
          window.removeEventListener('resize', handleResize);
          
          if (containerRef.current) {
            containerRef.current.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
            
            containerRef.current.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            
            // Remove the renderer
            if (rendererRef.current && containerRef.current.contains(rendererRef.current.domElement)) {
              containerRef.current.removeChild(rendererRef.current.domElement);
            }
          }
          
          // Stop animation loop
          if (frameIdRef.current !== null) {
            cancelAnimationFrame(frameIdRef.current);
          }
        };
      } catch (error) {
        console.error('Error initializing 3D book viewer:', error);
        setIsLoading(false);
      }
    };
    
    init();
  }, [bookCover]);
  
  const createBook = async (scene: THREE.Scene, coverImage?: string) => {
    // Create a group to hold all book parts
    const bookGroup = new THREE.Group();
    bookRef.current = bookGroup;
    
    // Book dimensions
    const width = 3;
    const height = 4;
    const depth = 0.5;
    
    // Create book cover material
    let coverMaterial;
    
    if (coverImage) {
      // Use provided cover image
      const textureLoader = new THREE.TextureLoader();
      try {
        const texture = await new Promise<THREE.Texture>((resolve, reject) => {
          textureLoader.load(
            coverImage, 
            resolve, 
            undefined, 
            reject
          );
        });
        
        coverMaterial = new THREE.MeshStandardMaterial({ 
          map: texture,
          roughness: 0.8,
          metalness: 0.1
        });
      } catch (error) {
        console.error('Failed to load cover texture:', error);
        // Fallback to color
        coverMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x2a6ba8,
          roughness: 0.8,
          metalness: 0.1
        });
      }
    } else {
      // Default blue cover
      coverMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a6ba8,
        roughness: 0.8,
        metalness: 0.1
      });
    }
    
    // Book spine material (darker color)
    const spineMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a4b88, 
      roughness: 0.9,
      metalness: 0.1
    });
    
    // Book pages material (white with slight yellow tint)
    const pagesMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xfff8e7,
      roughness: 0.8,
      metalness: 0
    });
    
    // Front cover
    const frontCoverGeometry = new THREE.BoxGeometry(width, height, 0.1);
    const frontCover = new THREE.Mesh(frontCoverGeometry, coverMaterial);
    frontCover.position.z = depth / 2 - 0.05;
    bookGroup.add(frontCover);
    
    // Back cover
    const backCoverGeometry = new THREE.BoxGeometry(width, height, 0.1);
    const backCover = new THREE.Mesh(backCoverGeometry, coverMaterial);
    backCover.position.z = -depth / 2 + 0.05;
    bookGroup.add(backCover);
    
    // Spine
    const spineGeometry = new THREE.BoxGeometry(0.1, height, depth);
    const spine = new THREE.Mesh(spineGeometry, spineMaterial);
    spine.position.x = -width / 2 - 0.05;
    bookGroup.add(spine);
    
    // Pages
    const pagesGeometry = new THREE.BoxGeometry(width - 0.1, height - 0.2, depth - 0.2);
    const pages = new THREE.Mesh(pagesGeometry, pagesMaterial);
    bookGroup.add(pages);
    
    // Add title text to spine if needed (would require additional libraries)
    
    // Rotate book to a nice viewing angle
    bookGroup.rotation.x = 0.2;
    bookGroup.rotation.y = -0.3;
    
    // Add to scene
    scene.add(bookGroup);
  };
  
  const animate = () => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !bookRef.current) return;
    
    // Auto-rotate if enabled
    if (autoRotate && !mouseRef.current.isDown) {
      bookRef.current.rotation.y += 0.005;
    }
    
    // Render
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    
    // Continue animation loop
    frameIdRef.current = requestAnimationFrame(animate);
  };
  
  const handleResize = () => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
    
    // Update camera aspect ratio
    cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    cameraRef.current.updateProjectionMatrix();
    
    // Update renderer size
    rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
  };
  
  // Mouse event handlers
  const handleMouseDown = (event: MouseEvent) => {
    if (!containerRef.current) return;
    
    mouseRef.current.isDown = true;
    
    // Calculate normalized mouse coordinates
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = event.clientX - rect.left;
    mouseRef.current.y = event.clientY - rect.top;
  };
  
  const handleMouseUp = () => {
    mouseRef.current.isDown = false;
  };
  
  const handleMouseMove = (event: MouseEvent) => {
    if (!mouseRef.current.isDown || !containerRef.current || !bookRef.current) return;
    
    // Calculate delta from last position
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const deltaX = x - mouseRef.current.x;
    const deltaY = y - mouseRef.current.y;
    
    // Update book rotation based on mouse movement
    bookRef.current.rotation.y += deltaX * 0.01;
    bookRef.current.rotation.x += deltaY * 0.01;
    
    // Clamp vertical rotation to prevent book from flipping over
    bookRef.current.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, bookRef.current.rotation.x));
    
    // Update stored position
    mouseRef.current.x = x;
    mouseRef.current.y = y;
  };
  
  // Touch event handlers
  const handleTouchStart = (event: TouchEvent) => {
    if (!containerRef.current) return;
    
    mouseRef.current.isDown = true;
    
    const touch = event.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = touch.clientX - rect.left;
    mouseRef.current.y = touch.clientY - rect.top;
  };
  
  const handleTouchEnd = () => {
    mouseRef.current.isDown = false;
  };
  
  const handleTouchMove = (event: TouchEvent) => {
    if (!mouseRef.current.isDown || !containerRef.current || !bookRef.current) return;
    
    // Prevent scrolling
    event.preventDefault();
    
    const touch = event.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const deltaX = x - mouseRef.current.x;
    const deltaY = y - mouseRef.current.y;
    
    // Update book rotation based on touch movement
    bookRef.current.rotation.y += deltaX * 0.01;
    bookRef.current.rotation.x += deltaY * 0.01;
    
    // Clamp vertical rotation to prevent book from flipping over
    bookRef.current.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, bookRef.current.rotation.x));
    
    // Update stored position
    mouseRef.current.x = x;
    mouseRef.current.y = y;
  };
  
  const resetRotation = () => {
    if (!bookRef.current) return;
    
    // Reset to initial rotation
    bookRef.current.rotation.x = 0.2;
    bookRef.current.rotation.y = -0.3;
    bookRef.current.rotation.z = 0;
  };
  
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 bg-opacity-70 z-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}
      
      <div className="flex flex-col">
        <div 
          ref={containerRef} 
          className="w-full h-[300px] bg-slate-100 rounded-lg shadow-inner overflow-hidden"
          style={{ touchAction: 'none' }}
        />
        
        <div className="mt-3 flex items-center justify-between">
          <h3 className="text-lg font-medium">{bookTitle}</h3>
          
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetRotation} 
              title={t('book_viewer.reset_rotation')}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              {t('book_viewer.reset')}
            </Button>
            
            <Button 
              variant={autoRotate ? "default" : "outline"} 
              size="sm" 
              onClick={() => setAutoRotate(!autoRotate)}
            >
              {autoRotate ? t('book_viewer.stop_rotation') : t('book_viewer.auto_rotate')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}