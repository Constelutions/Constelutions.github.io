<template>
  <section class="container mx-auto py-12">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <p class="text-sm text-gray-500">Explore</p>
        <h2 class="text-3xl font-bold">Products</h2>
        <p class="text-gray-600">Discover our innovative range of tech products today!</p>
      </div>
      <button class="border px-4 py-2 text-sm">View all</button>
    </div>

    <!-- Product Carousel -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <div v-for="(product, index) in products" :key="index" class="text-center">
        <div class="bg-gray-200 h-48 flex items-center justify-center">
          <span class="text-gray-500">Image</span>
        </div>
        <p class="font-semibold mt-2">{{ product.name }}</p>
        <p class="text-sm text-gray-500">{{ product.category }}</p>
        <p class="font-bold">${{ product.price }}</p>
      </div>
    </div>

    <!-- Pagination and Navigation -->
    <div class="flex justify-between items-center mt-6">
      <div class="flex space-x-1">
        <span class="h-2 w-2 bg-gray-400 rounded-full" v-for="(dot, i) in 6" :key="i"></span>
      </div>
      <div class="flex space-x-2">
        <button class="border rounded-full p-2">⬅</button>
        <button class="border rounded-full p-2">➡</button>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="mt-12 border-t py-4 text-center">
    <div class="flex justify-between items-center container mx-auto">
      <div class="text-2xl font-semibold">Logo</div>
      <nav class="flex space-x-6 text-sm">
        <a href="#">Home Page</a>
        <a href="#">Our Products</a>
        <a href="#">Demos & Apps</a>
        <a href="#">Team Info</a>
      </nav>
      <button class="bg-black text-white px-4 py-2">Join</button>
    </div>
  </footer>
</template>

<script setup lang="ts">
const products = [
  { name: 'Smart Gadget', category: 'Pro', price: 55 },
  { name: 'Wireless Charger', category: 'Standard', price: 55 },
  { name: 'Bluetooth Speaker', category: 'Mini', price: 55 },
  { name: 'Smart Watch', category: 'Sport', price: 55 },
  { name: 'VR Headset', category: 'Elite', price: 55 }
];
</script>