'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Color, LinearFilter, MathUtils, TextureLoader, Vector2 } from 'three'

/**
 * One fixed, full-screen canvas behind the whole Work grid. Every card's image
 * is a WebGL plane that copies its DOM box's rect each frame, so layout stays
 * entirely in CSS and the shader only has to bend and sample.
 *
 * The bend is scroll-driven: the further a fragment sits from the vertical
 * centre of the screen, the further back in Z it is pushed, scaled by how fast
 * the page is moving. Standing still, the planes are perfectly flat.
 */

// Feel of the effect. Everything here is a uniform — tweak, don't touch GLSL.
const CONFIG = {
  // Depth the top/bottom edges push back to at full scroll speed. Negative
  // bows the card away from the camera.
  edgeCurve: -150,
  // How tightly the bend concentrates at the edges. Higher = flatter middle.
  edgePower: 2.5,
  // Scroll pixels per frame needed to reach the full bend.
  scrollSensitivity: 0.02,
  // How quickly raw scroll delta catches up to the smoothed value.
  velocityEase: 0.1,

  // Off by default — each is a separate scroll-reactive flourish.
  edgeScale: 0,
  velocityTilt: 0,
  rgbShift: 0,
  edgeOpacity: 0,

  // Cursor push-in on the hovered card.
  hoverEnabled: true,
  hoverZoom: 0.06,
  hoverDamp: 8,
}

const vertexShader = /* glsl */ `
  uniform vec2  uSize;
  uniform float uScreenHeight;
  uniform float uVelocity;
  uniform float uEdgeCurve;
  uniform float uEdgePower;
  uniform float uScrollSensitivity;
  uniform float uEdgeScale;
  uniform float uVelocityTilt;

  varying vec2  vUv;
  varying float vEdgeFactor;
  varying float vScrollIntensity;

  void main() {
    vUv = uv;

    // The geometry is a unit plane; uSize blows it up to the DOM box in px.
    vec3 p = position;
    p.xy *= uSize;

    if (uVelocityTilt != 0.0) {
      float tiltAngle = uVelocity * uVelocityTilt * 0.01;
      float c = cos(tiltAngle);
      float s = sin(tiltAngle);
      float rx = p.x * c - p.y * s;
      float ry = p.x * s + p.y * c;
      p.x = rx;
      p.y = ry;
    }

    vec4 worldPos = modelMatrix * vec4(p, 1.0);

    // Distance from the middle of the screen, not the middle of the card, so
    // the whole grid bends as one sheet as it scrolls past.
    float screenY = worldPos.y / (uScreenHeight * 0.5);
    float edgeFactor = pow(abs(screenY), uEdgePower);
    float scrollIntensity = clamp(abs(uVelocity) * uScrollSensitivity, 0.0, 1.0);

    vEdgeFactor = edgeFactor;
    vScrollIntensity = scrollIntensity;

    worldPos.z -= edgeFactor * uEdgeCurve * scrollIntensity;

    if (uEdgeScale != 0.0) {
      float currentScale = 1.0 - (edgeFactor * uEdgeScale * scrollIntensity);
      worldPos.xy *= currentScale;
    }

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uHasTex;
  uniform float uPlaneAspect;
  uniform float uTexAspect;
  uniform vec3  uColor;
  uniform float uRgbShift;
  uniform float uEdgeOpacity;
  uniform float uHover;
  uniform float uHoverZoom;

  varying vec2  vUv;
  varying float vEdgeFactor;
  varying float vScrollIntensity;

  void main() {
    float alpha = 1.0;
    if (uEdgeOpacity > 0.0) {
      alpha = 1.0 - clamp(vEdgeFactor * uEdgeOpacity * vScrollIntensity, 0.0, 1.0);
    }

    // Flat colour until the texture has decoded.
    vec4 base = vec4(uColor, alpha);

    if (uHasTex > 0.5) {
      // background-size: cover — shrink the sampled window on whichever
      // axis has slack so the image fills the box without stretching.
      vec2 uv = vUv;
      if (uPlaneAspect > uTexAspect) {
        uv.y = (uv.y - 0.5) * (uTexAspect / uPlaneAspect) + 0.5;
      } else {
        uv.x = (uv.x - 0.5) * (uPlaneAspect / uTexAspect) + 0.5;
      }

      // Hover pushes in about the centre, so the crop stays where it was.
      uv = (uv - 0.5) / (1.0 + uHover * uHoverZoom) + 0.5;

      if (uRgbShift > 0.0) {
        float shift = uRgbShift * vScrollIntensity * 0.05;
        float r = texture2D(uTexture, uv + vec2(shift, 0.0)).r;
        float g = texture2D(uTexture, uv).g;
        float b = texture2D(uTexture, uv - vec2(shift, 0.0)).b;
        base = vec4(r, g, b, alpha);
      } else {
        vec4 texColor = texture2D(uTexture, uv);
        base = vec4(texColor.rgb, texColor.a * alpha);
      }
    }

    gl_FragColor = base;
  }
`

function ImagePlane({ item, domRef, velRef, mouseRef, color }) {
  const { size } = useThree()
  const meshRef = useRef(null)
  const matRef = useRef(null)
  const hover = useRef(0)

  const texture = useMemo(() => {
    if (!item.src) return null
    const tex = new TextureLoader().load(item.src)
    tex.minFilter = LinearFilter
    tex.generateMipmaps = false
    return tex
  }, [item.src])

  useEffect(() => () => texture?.dispose(), [texture])

  const uniforms = useMemo(
    () => ({
      uSize: { value: new Vector2(1, 1) },
      uScreenHeight: { value: 0 },
      uVelocity: { value: 0 },
      uEdgeCurve: { value: CONFIG.edgeCurve },
      uEdgePower: { value: CONFIG.edgePower },
      uScrollSensitivity: { value: CONFIG.scrollSensitivity },
      uEdgeScale: { value: CONFIG.edgeScale },
      uVelocityTilt: { value: CONFIG.velocityTilt },
      uRgbShift: { value: CONFIG.rgbShift },
      uEdgeOpacity: { value: CONFIG.edgeOpacity },
      uHover: { value: 0 },
      uHoverZoom: { value: CONFIG.hoverZoom },
      uTexture: { value: texture },
      uHasTex: { value: 0 },
      uPlaneAspect: { value: 1 },
      uTexAspect: { value: 1 },
      uColor: { value: new Color(color) },
    }),
    [texture, color],
  )

  useFrame((_, delta) => {
    const el = domRef.current
    const mesh = meshRef.current
    const mat = matRef.current
    if (!el || !mesh || !mat) return

    const rect = el.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    if (w <= 0 || h <= 0) return

    // Viewport pixels → world units: the Rig keeps the camera at 1:1, with the
    // origin at the centre of the screen and +Y up.
    mesh.position.set(
      rect.left + w / 2 - size.width / 2,
      -(rect.top + h / 2 - size.height / 2),
      0,
    )

    const u = mat.uniforms
    u.uSize.value.set(w, h)
    u.uScreenHeight.value = size.height
    u.uVelocity.value = MathUtils.clamp(velRef.current, -150, 150)
    u.uPlaneAspect.value = w / h

    // `image` only exists once the file has decoded — until then the plane
    // stays a flat swatch rather than sampling an empty texture.
    if (texture?.image) {
      u.uHasTex.value = 1
      u.uTexAspect.value =
        texture.image.width / Math.max(texture.image.height, 1)
    }

    const { x: mx, y: my } = mouseRef.current
    const isHovered =
      CONFIG.hoverEnabled &&
      mx >= rect.left &&
      mx <= rect.right &&
      my >= rect.top &&
      my <= rect.bottom

    hover.current = MathUtils.damp(
      hover.current,
      isHovered ? 1 : 0,
      CONFIG.hoverDamp,
      delta,
    )
    u.uHover.value = hover.current
  })

  return (
    <mesh ref={meshRef} frustumCulled={false}>
      {/* Segmented so the vertex bend has something to bend. */}
      <planeGeometry args={[1, 1, 24, 24]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
      />
    </mesh>
  )
}

/**
 * Matches the camera to CSS pixels — one world unit is one px at z = 0 — and
 * publishes a smoothed scroll delta for the planes to bend against.
 */
function Rig({ velRef }) {
  const lastScroll = useRef(0)
  const smooth = useRef(0)

  // Camera and size come off the frame state rather than useThree() — this
  // callback mutates them, which is not something a render-phase value allows.
  useFrame(({ camera, size }) => {
    const perspective = 1000
    camera.position.z = perspective
    camera.fov = (2 * Math.atan(size.height / 2 / perspective) * 180) / Math.PI
    camera.updateProjectionMatrix()

    const s = window.scrollY
    const raw = s - lastScroll.current
    lastScroll.current = s
    smooth.current = MathUtils.lerp(smooth.current, raw, CONFIG.velocityEase)
    velRef.current = smooth.current
  }, -1)

  return null
}

export default function WorkCanvas({
  items,
  boxRefs,
  target = '#work',
  color = '#d4d4d8',
}) {
  const velRef = useRef(0)
  const mouseRef = useRef(new Vector2(-1000, -1000))
  // Client-only (the parent imports this with ssr:false), so the target is
  // already in the DOM — with nothing to observe, just render unconditionally.
  const [inView, setInView] = useState(() => !document.querySelector(target))

  // The canvas is fixed over the whole page, so park the render loop and the
  // mousemove listener whenever the section is nowhere near the viewport.
  useEffect(() => {
    const el = document.querySelector(target)
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '20% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  useEffect(() => {
    if (!inView) return

    const onMove = (e) => mouseRef.current.set(e.clientX, e.clientY)
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [inView])

  return (
    <div className="pointer-events-none fixed inset-0 z-150 [&_canvas]:pointer-events-none">
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 1000], near: 0.1, far: 5000, fov: 50 }}
        style={{ pointerEvents: 'none' }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Rig velRef={velRef} />
        {items.map((item, i) => (
          <ImagePlane
            key={item.title}
            item={item}
            domRef={boxRefs[i]}
            velRef={velRef}
            mouseRef={mouseRef}
            color={color}
          />
        ))}
      </Canvas>
    </div>
  )
}
