<template>
  <section class="text-white py-30 px-4">
    <div class="container mx-auto">
      <!-- Header Section -->
      <div class="mb-12">
        <p class="text-sm text-gray-400 font-semibold uppercase tracking-wide">Showcase</p>
        <h2 class="text-4xl font-bold mb-2">Our Projects</h2>
        <p class="text-gray-300 max-w-2xl">Explore the work we're building. From live products to upcoming innovations
          in spatial computing and developer tools.</p>
      </div>

      <!-- Projects Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div v-for="(project, index) in projects" :key="index"
          class="group bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 hover:shadow-xl transition-all duration-300">
          <!-- Project Image/Icon Area -->
          <div class="h-48 bg-gradient-to-br flex items-center justify-center relative overflow-hidden"
            :style="{ backgroundImage: project.gradient || 'linear-gradient(135deg, #374151 0%, #1f2937 100%)' }">
            <div class="text-5xl opacity-30 group-hover:scale-110 transition-transform duration-300">
              {{ project.icon }}
            </div>
          </div>

          <!-- Project Content -->
          <div class="p-6">
            <div class="flex items-start justify-between gap-3 mb-3">
              <h3 class="font-bold text-lg leading-tight">{{ project.name }}</h3>
              <span :class="{
                'bg-emerald-900 text-emerald-300': project.status === 'Live',
                'bg-blue-900 text-blue-300': project.status === 'In Progress',
                'bg-gray-700 text-gray-300': project.status === 'Planned'
              }" class="inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                {{ project.status }}
              </span>
            </div>

            <p class="text-sm text-gray-400 mb-4 line-clamp-2">{{ project.description }}</p>

            <!-- Technology Tags -->
            <div class="flex flex-wrap gap-2">
              <span v-for="tech in project.technologies" :key="tech"
                class="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                {{ tech }}
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Project {
  name: string;
  description: string;
  status: 'Live' | 'In Progress' | 'Planned';
  progress: number;
  icon: string;
  gradient?: string;
  technologies: string[];
  link?: string;
}

const projects: Project[] = [
  {
    name: 'Constelutions Website',
    description: 'Our company landing site and portfolio — a showcase of who we are and what we do.',
    status: 'Live',
    progress: 100,
    icon: '🌐',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    technologies: ['Vue 3', 'TypeScript', 'Tailwind CSS'],
    link: '#'
  },
  {
    name: 'Tesseract SDK',
    description: 'A powerful SDK for spatial data visualization and 3D environment mapping with real-time processing.',
    status: 'In Progress',
    progress: 60,
    icon: '📦',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    technologies: ['TypeScript', 'WebGL', 'Three.js'],
    link: '#'
  },
  {
    name: 'Analytics Dashboard',
    description: 'Comprehensive admin dashboard for tracking metrics, generating reports, and managing client data.',
    status: 'In Progress',
    progress: 35,
    icon: '📊',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    technologies: ['React', 'Node.js', 'PostgreSQL'],
    link: '#'
  },
  {
    name: 'Developer Portal',
    description: 'Self-service platform for developers to manage API keys, access documentation, and monitor usage.',
    status: 'In Progress',
    progress: 25,
    icon: '👨‍💻',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    technologies: ['Next.js', 'TypeScript', 'Stripe API'],
    link: '#'
  },
  {
    name: 'Mobile App (iOS)',
    description: 'Native iOS application for on-the-go access to Constelutions services and real-time notifications.',
    status: 'Planned',
    progress: 5,
    icon: '📱',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    technologies: ['Swift', 'SwiftUI', 'iOS 15+'],
    link: '#'
  },
  {
    name: 'AI Integration Suite',
    description: 'Advanced AI-powered tools and APIs for intelligent automation, data analysis, and predictive modeling.',
    status: 'Planned',
    progress: 10,
    icon: '🤖',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    technologies: ['Python', 'TensorFlow', 'FastAPI'],
    link: '#'
  }
];
</script>