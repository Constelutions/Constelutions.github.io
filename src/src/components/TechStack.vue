<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface TechItem {
  icon: string
  name: string
}

const techItems: TechItem[] = [
  { icon: '⚛️', name: 'React & Vue' },
  { icon: '📘', name: 'TypeScript' },
  { icon: '🎨', name: 'Tailwind CSS' },
  { icon: '🟢', name: 'Node.js' },
  { icon: '🐘', name: 'PostgreSQL' },
  { icon: '🚀', name: 'Next.js' },
  { icon: '🎮', name: 'WebGL' },
  { icon: '🤖', name: 'Python & AI' },
  { icon: '📱', name: 'Swift & iOS' }
]

const currentIndex = ref(0)
const isVisible = ref(false)
const containerRef = ref<HTMLElement>()
let interval: number | null = null

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          startAnimation()
          observer.disconnect()
        }
      })
    },
    { threshold: 0.1 }
  )

  if (containerRef.value) {
    observer.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})

const startAnimation = () => {
  interval = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % techItems.length
  }, 2000) // Change every 2 seconds
}
</script>

<template>
  <div ref="containerRef" class="flex flex-col items-center">
    <h3 class="text-2xl font-bold mb-12 text-center">Our Tech Stack</h3>
    <div class="relative w-96 h-56">
      <div
        v-for="(item, index) in techItems"
        :key="item.name"
        :class="[
          'absolute top-0 left-0 w-full h-full bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col items-center justify-center transition-all duration-500 ease-in-out',
          index === currentIndex ? 'z-10 scale-100 opacity-100' : 'z-0 scale-95 opacity-70'
        ]"
        :style="{
          transform: `translateX(${ (index - currentIndex) * 10 }px) rotate(${ (index - currentIndex) * 2 }deg)`,
          zIndex: techItems.length - Math.abs(index - currentIndex)
        }"
      >
        <span class="text-5xl mb-3">{{ item.icon }}</span>
        <p class="text-sm text-gray-400 text-center font-medium">{{ item.name }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles for smooth transitions */
</style>