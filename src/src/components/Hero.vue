<script setup lang="ts">
import Hyperpyramid from './Hyperpyramid.vue';
import Logo from './Logo.vue';
import ParticlesBackground from './ParticlesBackground.vue';
import Tesseract from './Tesseract.vue';
import Tesseract2 from './Tesseract2.vue';
import Tesseract3 from './Tesseract3.vue';
import Tesseract4 from './Tesseract4.vue';

const particlesOptions = {
  particles: {
    number: { value: 100, density: { enable: true, value_area: 500 } },
    color: { value: "#ffffff" },
    shape: {
      type: "circle",
      stroke: { width: 0, color: "#000000" },
      polygon: { nb_sides: 6 },
      image: { src: "img/github.svg", width: 100, height: 100 },
    },
    opacity: {
      value: 0.25,
      random: true,
      anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false },
    },
    size: { value: 5, random: true, anim: { enable: false, speed: 10, size_min: 1, sync: false } },
    line_linked: { enable: false, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
    move: {
      enable: true,
      speed: 3,
      direction: "top",
      random: false,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: { enable: false, rotateX: 600, rotateY: 1200 },
    },
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: { enable: false, mode: "repulse" },
      onclick: { enable: true, mode: "push" },
      resize: true,
    },
    modes: {
      grab: { distance: 400, line_linked: { opacity: 1 } },
      bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
      repulse: { distance: 200, duration: 0.4 },
      push: { particles_nb: 4 },
      remove: { particles_nb: 2 },
    },
  },
  retina_detect: true,
};
</script>

<template>
  <div class="bg-gray-900 text-white h-screen relative flex justify-center items-center">
    <ParticlesBackground />

    <Logo class="absolute top-0 mt-6" fill="white" />

    <div class="xl:flex xl:items-center xl:gap-x-8 2xl:gap-x-36">
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
          <button class="border-2 border-white w-32 h-12 rounded-md">Learn More</button>
        </div>
      </div>

      <div class="hidden xl:block">
        <!-- Credits to https://codepen.io/olifemb/pen/QWwwZPz-->
        <Tesseract4 />
      </div>
    </div>

  </div>

</template>
