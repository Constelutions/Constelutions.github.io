<script setup lang="ts">
import FacebookIcon from './FacebookIcon.vue';
import InstagramIcon from './InstagramIcon.vue';
import LinkedInIcon from './LinkedInIcon.vue';
import Logo from './Logo.vue';
import TwitterIcon from './TwitterIcon.vue';
import YouTubeIcon from './YouTubeIcon.vue';

const links01 = [
  {
    label: "About Us",
    href: "#"
  },
  {
    label: "Our Services",
    href: "#"
  },
  {
    label: "Contact Us",
    href: "#"
  },
  {
    label: "Blog Posts",
    href: "#"
  },
  {
    label: "Support Center",
    href: "#"
  }
];
</script>

<template>
  <footer class="bg-gray-900 text-white py-16 px-4 md:px-16">
    <!-- Main Footer Content -->
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
        <!-- Logo Section -->
        <div class="flex flex-col items-center lg:items-start lg:col-span-1">
          <Logo class="bg-gradient-to-br from-blue-600 to-blue-500 px-4 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform hover:scale-105" fill="white" />
          <p class="text-gray-400 text-sm mt-4 text-center lg:text-left max-w-sm">Innovating technology that shines bright like the stars.</p>
        </div>

        <!-- Links Section 1 -->
        <nav class="flex flex-col items-center lg:items-start">
          <h4 class="text-sm font-semibold text-gray-200 uppercase tracking-widest mb-6">Resources</h4>
          <ul class="space-y-3">
            <li v-for="link of links01" :key="link.label">
              <a :href="link.href" class="text-gray-400 hover:text-white transition-colors duration-200 relative group">
                {{ link.label }}
                <span class="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 group-hover:w-full transition-all duration-300"></span>
              </a>
            </li>
          </ul>
        </nav>

        <!-- Social Media Section -->
        <div class="flex flex-col items-center lg:items-start">
          <h4 class="text-sm font-semibold text-gray-200 uppercase tracking-widest mb-6">Follow Us</h4>
          <div class="flex gap-3 flex-wrap justify-center lg:justify-start">
            <a href="#" class="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-500 flex items-center justify-center transition-all duration-300 text-gray-400 hover:text-white group hover:shadow-lg hover:shadow-blue-500/20 transform hover:scale-110">
              <FacebookIcon class="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            </a>
            <a href="#" class="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-500 flex items-center justify-center transition-all duration-300 text-gray-400 hover:text-white group hover:shadow-lg hover:shadow-blue-500/20 transform hover:scale-110">
              <InstagramIcon class="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            </a>
            <a href="#" class="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-500 flex items-center justify-center transition-all duration-300 text-gray-400 hover:text-white group hover:shadow-lg hover:shadow-blue-500/20 transform hover:scale-110">
              <TwitterIcon class="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            </a>
            <a href="#" class="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-500 flex items-center justify-center transition-all duration-300 text-gray-400 hover:text-white group hover:shadow-lg hover:shadow-blue-500/20 transform hover:scale-110">
              <LinkedInIcon class="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            </a>
            <a href="#" class="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-500 flex items-center justify-center transition-all duration-300 text-gray-400 hover:text-white group hover:shadow-lg hover:shadow-blue-500/20 transform hover:scale-110">
              <YouTubeIcon class="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8"></div>

      <!-- Bottom Section -->
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <!-- Copyright -->
        <p class="text-gray-500 text-sm text-center md:text-left hover:text-gray-400 transition-colors duration-200">
          &copy; 2025 Constelutions. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>
