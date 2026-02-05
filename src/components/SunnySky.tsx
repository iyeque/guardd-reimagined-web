import React, { useEffect, useRef, useCallback } from 'react';
import { Renderer, Program, Mesh, Color, Triangle, Camera } from 'ogl';
import { cn } from '@/lib/utils';

const vertexShader = `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
  }
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uMouse;

// Sky-related constants
const vec3 sunDirection = normalize(vec3(0.0, 0.2, 1.0));
const float sunIntensity = 20.0;
const vec3 skyColor = vec3(0.5, 0.7, 1.0);
const vec3 horizonColor = vec3(0.8, 0.9, 1.0);

// Cloud-related constants
const float cloudCover = 0.5;
const float cloudSharpness = 0.1;
const vec3 cloudColorLight = vec3(1.0, 1.0, 1.0);
const vec3 cloudColorDark = vec3(0.7, 0.8, 0.9);

// FBM noise function
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = rand(i);
    float b = rand(i + vec2(1.0, 0.0));
    float c = rand(i + vec2(0.0, 1.0));
    float d = rand(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 2.0;
    
    for (int i = 0; i < 6; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Domain warping for more natural clouds
vec2 domainWarp(vec2 p, float amount) {
    vec2 q = vec2(fbm(p), fbm(p + vec2(5.2, 1.3)));
    return p + amount * (q - 0.5);
}

// Single cloud layer function
float cloudLayer(vec2 uv, float speed, float scale, float warpAmount) {
    vec2 warpedUV = domainWarp(uv * scale, warpAmount);
    warpedUV.x += uTime * speed;
    float cloud = fbm(warpedUV);
    return smoothstep(cloudCover - cloudSharpness, cloudCover + cloudSharpness, cloud);
}

// Atmospheric scattering
vec3 getAtmosphere(vec3 eye, vec3 dir) {
    float height = 0.1;
    float t = (-eye.y + height) / dir.y;
    
    // Sky gradient
    vec3 finalColor = mix(horizonColor, skyColor, smoothstep(0.0, 0.5, dir.y));
    
    // Interactive Sun
    vec2 mouseOffset = (uMouse - 0.5) * 0.2;
    vec3 interactiveSunDir = normalize(sunDirection + vec3(mouseOffset, 0.0));
    float sun = smoothstep(0.995, 1.0, dot(dir, interactiveSunDir));
    finalColor += vec3(1.0, 0.9, 0.7) * sun * sunIntensity;
    
    return finalColor;
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    uv.y = 1.0 - uv.y;
    
    vec3 eye = vec3(0.0, 0.0, -1.0);
    vec3 dir = normalize(vec3(uv * 2.0 - 1.0, 1.0));
    
    // Base sky color
    vec3 color = getAtmosphere(eye, dir);
    
    // Multiple cloud layers
    float cloud1 = cloudLayer(uv, 0.05, 1.5, 0.2);
    float cloud2 = cloudLayer(uv, 0.08, 3.0, 0.3);
    float cloud3 = cloudLayer(uv, 0.1, 6.0, 0.4);
    
    float totalCloud = cloud1 * 0.6 + cloud2 * 0.3 + cloud3 * 0.1;
    
    // Cloud coloring with sun lighting
    vec3 cloudColor = mix(cloudColorDark, cloudColorLight, smoothstep(0.0, 0.3, dot(dir, sunDirection)));
    color = mix(color, cloudColor, totalCloud);

    gl_FragColor = vec4(color, 1.0);
}
`;

interface SunnySkyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SunnySky = ({ className, ...rest }: SunnySkyProps) => {
  const ctnDom = useRef<HTMLDivElement>(null);
  const targetMousePos = useRef({ x: 0.5, y: 0.5 });
  const smoothMousePos = useRef({ x: 0.5, y: 0.5 });
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    targetMousePos.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;

    const renderer = new Renderer({
      alpha: false,
      premultipliedAlpha: false,
      dpr: Math.min(window.devicePixelRatio, 2.5),
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    
    const gl = renderer.gl;
    const camera = new Camera(gl);
    
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Color(ctn.clientWidth, ctn.clientHeight, ctn.clientWidth / ctn.clientHeight)
        },
        uMouse: {
          value: new Float32Array([smoothMousePos.current.x, smoothMousePos.current.y])
        },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    let animateId: number;

    function resize() {
      if (!ctn) return;
      renderer.setSize(ctn.clientWidth, ctn.clientHeight);
      
      program.uniforms.uResolution.value = new Color(
        ctn.clientWidth,
        ctn.clientHeight,
        ctn.clientWidth / ctn.clientHeight
      );
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(ctn);
    resize();

    ctn.appendChild(gl.canvas);
    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    function update(t: number) {
      animateId = requestAnimationFrame(update);
      
      time += 0.01;
      program.uniforms.uTime.value = time;

      // Smooth mouse interpolation
      smoothMousePos.current.x += (targetMousePos.current.x - smoothMousePos.current.x) * 0.05;
      smoothMousePos.current.y += (targetMousePos.current.y - smoothMousePos.current.y) * 0.05;
      
      program.uniforms.uMouse.value[0] = smoothMousePos.current.x;
      program.uniforms.uMouse.value[1] = smoothMousePos.current.y;

      renderer.render({ scene: mesh });
    }
    animateId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animateId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      if (gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [handleMouseMove]);

  return (
    <div 
      ref={ctnDom} 
      className={cn("w-full h-full fixed inset-0 -z-10", className)} 
      {...rest}
    />
  );
};