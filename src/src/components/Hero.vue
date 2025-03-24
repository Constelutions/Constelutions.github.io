<script setup lang="ts">
import Logo from './Logo.vue';
import ParticlesBackground from './ParticlesBackground.vue';
import Tesseract from './Tesseract.vue';
</script>

<template>
  <div class="text-white h-screen relative flex justify-center items-center">
    <ParticlesBackground class="absolute top-0 left-0 w-screen h-screen z-1" />

    <Logo class="animate-fade-in absolute top-0 mt-6 z-2" fill="white" />

    <div class="animate-fade-in z-2 xl:flex xl:items-center xl:gap-x-8 2xl:gap-x-36">
      <div class="px-6 xl:p-0">
        <h1 class="text-4xl text-center mb-2 xl:text-5xl xl:text-left xl:mb-4">
          Welcome to Constelutions
        </h1>

        <h1 class="text-4xl text-center font-bold mb-10 xl:text-5xl xl:text-left">
          Where stars meet innovation
        </h1>

        <p class="text-center max-w-[30rem] mb-10 xl:text-lg xl:text-left">
          At Constelutions, we blend the brilliance of the cosmos with cutting-edge technology to bring your ideas to
          life. Join us on a journey through the universe of possibilities.
        </p>

        <div class="flex justify-center xl:justify-start">
          <button class="bg-white text-gray-800 w-32 h-12 font-semibold rounded-md mr-6 cursor-pointer">Explore</button>
          <button class="border-2 border-white w-32 h-12 rounded-md cursor-pointer">Learn More</button>
        </div>
      </div>

      <div class="hidden xl:block">
        <!-- Credits to https://codepen.io/olifemb/pen/QWwwZPz-->
        <Tesseract />
      </div>
    </div>
  </div>

</template>
