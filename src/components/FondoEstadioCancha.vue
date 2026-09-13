<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden z-0 select-none" aria-hidden="true">
    <!-- ============================================== -->
    <!-- 1. RESPLANDOR CENITAL DE ESTADIO (SPOTLIGHTS)  -->
    <!-- ============================================== -->
    <!-- Foco central de estadio WTT (azul eléctrico cenital) -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] sm:w-[1400px] sm:h-[650px] bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(14,165,233,0.18),transparent_70%)] dark:bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(14,165,233,0.22),transparent_70%)] opacity-80"
    ></div>

    <!-- Foco lateral cálido (naranja SpinApp vibrante) -->
    <div
      class="absolute top-48 -right-32 w-[550px] h-[550px] bg-[radial-gradient(circle,rgba(249,115,22,0.12),transparent_65%)] dark:bg-[radial-gradient(circle,rgba(249,115,22,0.14),transparent_65%)]"
    ></div>

    <!-- Foco inferior izquierdo (esmeralda torneo) -->
    <div
      class="absolute bottom-10 -left-28 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(16,185,129,0.08),transparent_60%)] dark:bg-[radial-gradient(circle,rgba(16,185,129,0.10),transparent_60%)]"
    ></div>

    <!-- ============================================== -->
    <!-- 2. MICRO-MALLA TÉCNICA DE RED (NET MESH TEXTURE)-->
    <!-- ============================================== -->
    <div
      class="absolute inset-0 opacity-30 dark:opacity-25 [background-image:radial-gradient(#64748b_1px,transparent_1px)] dark:[background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_45%,#000_40%,transparent_95%)]"
    ></div>

    <!-- ============================================== -->
    <!-- 3. LÍNEAS REGLAMENTARIAS DE CANCHA DE PING PONG -->
    <!-- ============================================== -->
    <div class="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6">
      <svg
        class="w-full h-full opacity-25 dark:opacity-20 text-slate-400 dark:text-sky-300 stroke-current"
        viewBox="0 0 1200 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <!-- Perímetro exterior de la cancha (Área de juego reglamentaria 14m x 7m) -->
        <rect
          x="30"
          y="280"
          width="1140"
          height="590"
          rx="24"
          stroke-width="1.5"
          stroke-dasharray="16 10"
          class="opacity-60"
        />

        <!-- Línea central de saque (Eje de competición) -->
        <line
          x1="600"
          y1="280"
          x2="600"
          y2="870"
          stroke-width="2"
          stroke-dasharray="8 6"
          class="opacity-70"
        />

        <!-- Zona de Red (Net Division Line con postes tensores) -->
        <line
          x1="30"
          y1="575"
          x2="1170"
          y2="575"
          stroke-width="2.5"
          class="opacity-80"
        />

        <!-- Postes laterales tensores de red -->
        <circle cx="30" cy="575" r="5" fill="currentColor" class="opacity-90" />
        <circle cx="1170" cy="575" r="5" fill="currentColor" class="opacity-90" />
        <circle cx="600" cy="575" r="7" fill="none" stroke-width="2" class="opacity-80" />

        <!-- Marcas técnicas esquineras "+" estilo ITTF World Table Tennis -->
        <g stroke-width="2" class="opacity-80">
          <!-- Esquina superior izquierda -->
          <path d="M 60 300 L 80 300 M 70 290 L 70 310" />
          <!-- Esquina superior derecha -->
          <path d="M 1120 300 L 1140 300 M 1130 290 L 1130 310" />
          <!-- Esquina inferior izquierda -->
          <path d="M 60 850 L 80 850 M 70 840 L 70 860" />
          <!-- Esquina inferior derecha -->
          <path d="M 1120 850 L 1140 850 M 1130 840 L 1130 860" />
          <!-- Marcadores de centro de cancha -->
          <path d="M 590 310 L 610 310 M 600 300 L 600 320" />
          <path d="M 590 840 L 610 840 M 600 830 L 600 850" />
        </g>

        <!-- Arcos orbitales aerodinámicos de pelota de tenis de mesa -->
        <path
          d="M 200 420 Q 600 360 1000 480"
          stroke-width="1.2"
          stroke-dasharray="4 8"
          class="opacity-40"
        />
        <path
          d="M 150 720 Q 600 800 1050 680"
          stroke-width="1.2"
          stroke-dasharray="4 8"
          class="opacity-40"
        />
      </svg>
    </div>

    <!-- ============================================== -->
    <!-- 4. SILUETA DINÁMICA DE PALETA Y PELOTA WTT     -->
    <!-- ============================================== -->
    <!-- Marca de agua artística en la zona lateral derecha -->
    <div
      class="hidden lg:block absolute top-[360px] right-8 xl:right-16 w-[420px] h-[420px] opacity-[0.04] dark:opacity-[0.06] text-white pointer-events-none"
    >
      <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1.5">
        <!-- Racket Blade -->
        <circle cx="95" cy="85" r="55" />
        <circle cx="95" cy="85" r="50" stroke-dasharray="6 6" />
        <!-- Racket Handle -->
        <path d="M 85 135 L 75 185 Q 95 195 115 185 L 105 135 Z" fill="currentColor" fill-opacity="0.1" />
        <!-- Ball in motion -->
        <circle cx="155" cy="45" r="14" fill="currentColor" fill-opacity="0.15" />
        <path d="M 140 60 Q 120 75 95 85" stroke-dasharray="3 5" />
        <path d="M 170 30 Q 185 15 190 5" stroke-dasharray="2 4" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
// Componente decorativo de alto rendimiento visual: Estadio WTT & Líneas de Cancha
</script>
