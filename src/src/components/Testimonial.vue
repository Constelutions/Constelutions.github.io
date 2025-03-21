<template>
  <div class="flex flex-col items-center text-center p-6 bg-white shadow-lg rounded-xl max-w-xl mx-auto">
    <div class="flex mb-2">
      <span v-for="star in 5" :key="star" class="text-yellow-500 text-xl">&#9733;</span>
    </div>
    <blockquote class="text-lg font-semibold text-gray-900">
      "The innovative designs from Constellations transformed our online presence and boosted our sales significantly!
      Their attention to detail and customer service is unmatched."
    </blockquote>
    <div class="flex items-center mt-4">
      <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
        <span class="text-gray-500 text-sm">JD</span>
      </div>
      <div class="ml-3 text-left">
        <p class="text-sm font-bold text-gray-900">Jane Doe</p>
        <p class="text-sm text-gray-500">CEO, TechCorp</p>
      </div>
      <img src="https://upload.wikimedia.org/wikipedia/commons/3/3b/Webflow_logo.png" alt="Webflow" class="h-6 ml-4">
    </div>
  </div>
</template>