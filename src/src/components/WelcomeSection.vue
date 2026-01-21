<script setup lang="ts">
import TechStack from './TechStack.vue'
</script>

<template>
  <section class="text-white py-30 px-4">
    <div class="container mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- Left Section - Content -->
        <div>
          <p class="text-sm text-gray-400 font-semibold uppercase tracking-wide mb-3">About Us</p>
          <h1 class="text-4xl font-bold mb-6">
            Welcome to Constelutions
            <span class="block text-blue-400 mt-2">Where Innovation Meets the Stars</span>
          </h1>
          <p class="text-gray-300 mb-8 leading-relaxed">
            At Constelutions, we're dedicated to revolutionizing the tech landscape with cutting-edge products and
            solutions. Our mission is to blend creativity and technology to inspire and empower users worldwide.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 class="font-bold text-lg mb-2 flex items-center gap-2">
                <span class="text-blue-400">⭐</span> Our Vision
              </h3>
              <p class="text-gray-400">Innovating technology that shines bright like the stars.</p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 class="font-bold text-lg mb-2 flex items-center gap-2">
                <span class="text-purple-400">🚀</span> Our Mission
              </h3>
              <p class="text-gray-400">To create stellar solutions that enhance everyday experiences.</p>
            </div>
          </div>

          <TechStack class="lg:hidden" />
        </div>

        <!-- Right Section - Tech Stack -->
        <div class="flex justify-center items-center">
          <TechStack class="hidden lg:block" />
        </div>
      </div>
    </div>
  </section>
</template>