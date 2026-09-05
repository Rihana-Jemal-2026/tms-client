import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, PLATFORM_ID, NgZone } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import * as THREE from "three";

@Component({
  selector: "app-three-background",
  standalone: true,
  template: `<div #canvasContainer class="threejs-ambient-background"></div>`,
  styles: [`
    .threejs-ambient-background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
      opacity: 0.7;
      mix-blend-mode: screen;
    }
  `],
})
export class ThreeBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild("canvasContainer", { static: true }) canvasContainer!: ElementRef<HTMLDivElement>;

  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private animFrameId: number | null = null;
  private renderer?: THREE.WebGLRenderer;
  private mouseMoveListener?: (e: MouseEvent) => void;
  private resizeListener?: () => void;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Execute ThreeJS WebGL setup outside Angular's Zone.js to prevent triggering global CD on every frame
    this.ngZone.runOutsideAngular(() => {
      this.initThreeJs();
    });
  }

  private initThreeJs(): void {
    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLightIndigo = new THREE.PointLight(0x4f46e5, 1.2);
    pointLightIndigo.position.set(5, 5, 5);
    scene.add(pointLightIndigo);

    const pointLightCyan = new THREE.PointLight(0x06b6d4, 1.2);
    pointLightCyan.position.set(-5, -5, 5);
    scene.add(pointLightCyan);

    // Group for Shapes
    const group = new THREE.Group();
    scene.add(group);

    const materialIndigo = new THREE.MeshPhongMaterial({
      color: 0x4f46e5,
      shininess: 100,
      transparent: true,
      opacity: 0.85,
    });

    const materialCyan = new THREE.MeshPhongMaterial({
      color: 0x06b6d4,
      shininess: 100,
      transparent: true,
      opacity: 0.7,
    });

    interface ShapeItem {
      mesh: THREE.Mesh;
      rotSpeed: { x: number; y: number };
      offset: number;
    }

    const shapes: ShapeItem[] = [];

    const createShape = (geometry: THREE.BufferGeometry, material: THREE.Material, pos: { x: number; y: number; z: number }) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(pos.x, pos.y, pos.z);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      group.add(mesh);
      shapes.push({
        mesh,
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.008,
          y: (Math.random() - 0.5) * 0.008,
        },
        offset: Math.random() * Math.PI * 2,
      });
    };

    createShape(new THREE.IcosahedronGeometry(1.5, 0), materialIndigo, { x: -2.5, y: 1, z: 0 });
    createShape(new THREE.TorusGeometry(1.2, 0.3, 16, 100), materialCyan, { x: 2.5, y: -1, z: -1 });
    createShape(new THREE.OctahedronGeometry(0.9, 0), materialIndigo, { x: 0, y: 2.2, z: -2 });
    createShape(new THREE.BoxGeometry(0.6, 0.6, 0.6), materialCyan, { x: -3.2, y: -2, z: 1 });

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;

    this.mouseMoveListener = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", this.mouseMoveListener, { passive: true });

    // Resize Handler
    this.resizeListener = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", this.resizeListener, { passive: true });

    // High-performance animation loop running outside Angular Change Detection
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);

      const now = Date.now();
      shapes.forEach((s) => {
        s.mesh.rotation.x += s.rotSpeed.x;
        s.mesh.rotation.y += s.rotSpeed.y;
        s.mesh.position.y += Math.sin(now * 0.0015 + s.offset) * 0.0015;
      });

      group.rotation.x += (mouseY * 0.12 - group.rotation.x) * 0.05;
      group.rotation.y += (mouseX * 0.12 - group.rotation.y) * 0.05;

      renderer.render(scene, camera);
    };

    animate();
  }

  ngOnDestroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.mouseMoveListener) {
      window.removeEventListener("mousemove", this.mouseMoveListener);
    }
    if (this.resizeListener) {
      window.removeEventListener("resize", this.resizeListener);
    }
    if (this.renderer) {
      this.renderer.dispose();
      const dom = this.renderer.domElement;
      if (dom && dom.parentNode) {
        dom.parentNode.removeChild(dom);
      }
    }
  }
}
