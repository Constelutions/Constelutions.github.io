<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';
import FacebookIcon from './FacebookIcon.vue';
import InstagramIcon from './InstagramIcon.vue';
import LinkedInIcon from './LinkedInIcon.vue';
import Logo from './Logo.vue';
import TwitterIcon from './TwitterIcon.vue';
import YouTubeIcon from './YouTubeIcon.vue';

const currentYear: ComputedRef<number> = computed<number>(() => new Date().getFullYear());

</script>

<template>
  <footer class="text-white py-16 px-4">
    <!-- Main Footer Content -->
    <div class="container mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-20 items-center mb-12">
        <!-- Copyright Section (Left) -->
        <div class="flex flex-col items-center md:items-start">
          <p class="text-gray-500 text-lg text-center md:text-left">
            &copy; {{ currentYear }} <span class="font-semibold text-white">Constelutions</span>
          </p>
        </div>

        <!-- Logo Section (Center) -->
        <div class="flex flex-col items-center">
          <Logo class="bg-gradient-to-br from-blue-600 to-blue-500 px-4 py-3 rounded-xl" fill="white" />
          <p class="text-gray-400 text-sm mt-4 text-center max-w-sm">Innovating technology that shines bright like the
            stars.</p>
        </div>

        <!-- Social Media Section (Right) -->
        <div class="flex flex-col items-center md:items-end">
          <div class="flex gap-3 flex-wrap justify-center">
            <a href="#"
              class="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-500 flex items-center justify-center transition-all duration-300 text-gray-400 hover:text-white group hover:shadow-lg hover:shadow-blue-500/20 transform hover:scale-110">
              <FacebookIcon class="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            </a>
            <a href="#"
              class="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-500 flex items-center justify-center transition-all duration-300 text-gray-400 hover:text-white group hover:shadow-lg hover:shadow-blue-500/20 transform hover:scale-110">
              <InstagramIcon class="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            </a>
            <a href="#"
              class="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-500 flex items-center justify-center transition-all duration-300 text-gray-400 hover:text-white group hover:shadow-lg hover:shadow-blue-500/20 transform hover:scale-110">
              <TwitterIcon class="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            </a>
            <a href="#"
              class="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-500 flex items-center justify-center transition-all duration-300 text-gray-400 hover:text-white group hover:shadow-lg hover:shadow-blue-500/20 transform hover:scale-110">
              <LinkedInIcon class="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            </a>
            <a href="#"
              class="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-500 flex items-center justify-center transition-all duration-300 text-gray-400 hover:text-white group hover:shadow-lg hover:shadow-blue-500/20 transform hover:scale-110">
              <YouTubeIcon class="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
    </div>
  </footer>
</template>
