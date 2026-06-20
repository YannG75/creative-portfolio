import {useRef, useMemo, Suspense, useState} from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Float, Center, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { easing } from 'maath'
import * as THREE from 'three'

type FoxGLTF = {
  nodes: { Head: THREE.Mesh; Body: THREE.Mesh }
}

/* ── Mesh hologramme : arêtes lumineuses + surface quasi-invisible ── */
function HoloMesh({ geometry }: { geometry: THREE.BufferGeometry }) {
  const edges = useMemo(
    () => new THREE.EdgesGeometry(geometry, 12),
    [geometry],
  )

  return (
    <>
      {/* Arêtes — trait fin violet lumineux */}
      <lineSegments geometry={edges} renderOrder={2}>
        <lineBasicMaterial
          color="#c084fc"
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </lineSegments>

      {/* Volume — très transparent, juste pour la profondeur */}
      <mesh geometry={geometry} renderOrder={1}>
        <meshPhysicalMaterial
          color="#1a003a"
          emissive="#7c3aed"
          emissiveIntensity={0.4}
          transparent
          opacity={0.07}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}

function FoxModel({ isInCanvas }: { isInCanvas: boolean}) {
  const { nodes } = useGLTF('/models/fox.glb') as unknown as FoxGLTF
  const headRef = useRef<THREE.Group>(null)

  /* Rotation de base de la tête — extraite une seule fois */
  const baseRot = useMemo(
    () => [nodes.Head.rotation.x, nodes.Head.rotation.y, nodes.Head.rotation.z] as [number, number, number],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useFrame((state, delta) => {
    if (!headRef.current) return
    if (!isInCanvas) return
    easing.dampE(
      headRef.current.rotation,
      [
        baseRot[0] - state.pointer.y * 0.15,
        baseRot[1],
        baseRot[2] - state.pointer.x * 0.35,
      ],
      0.18,
      delta,
    )
  })

  return (
    <Center>
      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.25}>

        {/* Body — position/rotation/scale exactes du GLB */}
        <group
          position={[nodes.Body.position.x, nodes.Body.position.y, nodes.Body.position.z]}
          rotation={[nodes.Body.rotation.x, nodes.Body.rotation.y, nodes.Body.rotation.z]}
          scale={[nodes.Body.scale.x, nodes.Body.scale.y, nodes.Body.scale.z]}
        >
          <HoloMesh geometry={nodes.Body.geometry} />
        </group>

        {/* Head — rotation initiale via prop (Center la voit), dampE l'anime ensuite */}
        <group
          ref={headRef}
          position={[nodes.Head.position.x, nodes.Head.position.y, nodes.Head.position.z]}
          rotation={baseRot}
          scale={[nodes.Head.scale.x, nodes.Head.scale.y, nodes.Head.scale.z]}
        >
          <HoloMesh geometry={nodes.Head.geometry} />
        </group>

      </Float>
    </Center>
  )
}

useGLTF.preload('/models/fox.glb')

export default function FoxCanvas() {
  const [isInCanvas, setIsInCanvas] = useState(false)

  return (
    <Canvas
      camera={{ position: [0, 0.6, 6.5], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
      dpr={[1, 1.5]}
      onPointerOver={() => setIsInCanvas(true)}
      onPointerLeave={() => setIsInCanvas(false)}
    >
      <Suspense fallback={null}>
        {/* Lumières colorées : bloom sur les arêtes violettes */}
        <ambientLight intensity={0.02} />
        <pointLight position={[3, 4, 4]}    intensity={12} color="#a855f7" />
        <pointLight position={[-4, -1, -2]} intensity={7}  color="#00e5ff" />
        <pointLight position={[0, -3, 3]}   intensity={5}  color="#7c3aed" />

        <FoxModel isInCanvas={isInCanvas}/>

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.05}
            intensity={3.5}
            levels={7}
            mipmapBlur
          />
        </EffectComposer>

        {/* OrbitControls — l'utilisateur peut faire tourner le modèle */}
        <OrbitControls enableZoom={false} enablePan={false} />
      </Suspense>
    </Canvas>
  )
}
