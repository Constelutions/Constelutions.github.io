<script setup lang="ts">
import Logo from './Logo.vue';

</script>

<template>
  <nav class="bg-white text-black py-4 px-6 flex justify-between items-center shadow-md">
    <Logo fill="indigo" />
    <div class="hidden md:flex space-x-6">
      <a href="#" class="hover:underline">Home Page</a>
      <a href="#" class="hover:underline">Our Products</a>
      <a href="#" class="hover:underline">Demos & Apps</a>
      <div class="relative group">
        <button class="hover:underline">Team Info</button>
        <div class="absolute left-0 mt-2 hidden group-hover:block bg-white text-black shadow-lg py-2 px-4 rounded">
          <a href="#" class="block py-1">About Us</a>
          <a href="#" class="block py-1">Careers</a>
        </div>
      </div>
    </div>
    <button class="bg-black text-white px-4 py-2 rounded hover:bg-gray-700">Join</button>
  </nav>
</template>