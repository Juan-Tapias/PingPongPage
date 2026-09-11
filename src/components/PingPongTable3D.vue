<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Loader2 } from 'lucide-vue-next'

const containerRef = ref<HTMLDivElement | null>(null)
const cargando = ref(true)
const errorCarga = ref(false)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null
let animationFrameId: number | null = null
let resizeObserver: ResizeObserver | null = null
let tableGroup: THREE.Group | null = null

const init3D = () => {
  if (!containerRef.value) return

  const width = containerRef.value.clientWidth || 300
  const height = containerRef.value.clientHeight || 300

  // 1. Escena con fondo transparente para dejar brillar el degradado deportivo
  scene = new THREE.Scene()

  // 2. Cámara
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(0, 4, 7.5)

  // 3. Renderer con antialiasing y transparencia alfa
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.3
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  containerRef.value.appendChild(renderer.domElement)

  // 4. Orbit Controls para interacción suave
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = true
  controls.autoRotateSpeed = 1.8
  controls.enablePan = false
  controls.enableZoom = false // Evita interferir con el scroll de la página
  controls.minPolarAngle = Math.PI / 6 // 30 grados
  controls.maxPolarAngle = Math.PI / 2.1 // No ver desde debajo del suelo

  // 5. Luces tipo estadio / arena de ping pong
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
  scene.add(ambientLight)

  // Luz principal deportiva desde arriba
  const mainLight = new THREE.DirectionalLight(0xffffff, 2.5)
  mainLight.position.set(5, 8, 5)
  mainLight.castShadow = true
  scene.add(mainLight)

  // Luz cálida naranja reflectante lateral (vibra SpinApp)
  const orangeLight = new THREE.DirectionalLight(0xf97316, 2.8)
  orangeLight.position.set(-6, 3, -4)
  scene.add(orangeLight)

  // Luz fría azul/cian de estadio para contraste deportivo
  const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.0)
  rimLight.position.set(0, -3, 6)
  scene.add(rimLight)

  // 6. Carga del Modelo GLTF de Google Poly
  const loader = new GLTFLoader()
  loader.load(
    '/models/ping_pong_table/scene.gltf',
    (gltf) => {
      tableGroup = gltf.scene

      // Centrar y auto-ajustar escala según el bounding box
      const box = new THREE.Box3().setFromObject(tableGroup)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())

      tableGroup.position.x -= center.x
      tableGroup.position.y -= center.y
      tableGroup.position.z -= center.z

      // Escala armónica que llene el contenedor
      const maxDim = Math.max(size.x, size.y, size.z)
      const targetScale = 5.5 / (maxDim || 1)
      tableGroup.scale.set(targetScale, targetScale, targetScale)

      // Añadir leve inclinación dinámica para ver la red y la mesa
      tableGroup.rotation.x = 0.2
      tableGroup.rotation.y = -0.6

      // Ajustar materiales para iluminación vibrante
      tableGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.castShadow = true
          mesh.receiveShadow = true
        }
      })

      scene?.add(tableGroup)
      cargando.value = false
    },
    undefined,
    (err) => {
      console.error('Error al cargar el modelo 3D de mesa de ping pong:', err)
      cargando.value = false
      errorCarga.value = true
    }
  )

  // 7. Bucle de renderizado
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)

    if (controls) {
      controls.update()
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }
  animate()

  // 8. Responsive ResizeObserver
  resizeObserver = new ResizeObserver(() => {
    if (!containerRef.value || !camera || !renderer) return
    const newWidth = containerRef.value.clientWidth
    const newHeight = containerRef.value.clientHeight
    if (newWidth === 0 || newHeight === 0) return

    camera.aspect = newWidth / newHeight
    camera.updateProjectionMatrix()
    renderer.setSize(newWidth, newHeight)
  })
  resizeObserver.observe(containerRef.value)
}

onMounted(() => {
  init3D()
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (controls) {
    controls.dispose()
  }
  if (renderer) {
    renderer.dispose()
  }
  if (scene) {
    scene.clear()
  }
})
</script>

<template>
  <div class="relative w-full h-full min-h-[220px] sm:min-h-[280px] lg:min-h-[340px] flex items-center justify-center select-none overflow-hidden cursor-grab active:cursor-grabbing">
    <!-- Spinner mientras descarga el modelo -->
    <div
      v-if="cargando"
      class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-orange-400 z-10 animate-in fade-in"
    >
      <Loader2 class="w-8 h-8 animate-spin" />
      <span class="text-xs font-bold uppercase tracking-wider text-slate-300">
        Cargando Mesa 3D...
      </span>
    </div>


    <!-- Fallback si ocurre algún error -->
    <div
      v-if="errorCarga"
      class="absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-xs text-slate-400"
    >
      <span>Mesa oficial de torneo ITTF</span>
    </div>

    <!-- Contenedor Canvas WebGL -->
    <div ref="containerRef" class="w-full h-full" />
  </div>
</template>
