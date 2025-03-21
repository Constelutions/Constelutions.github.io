<template>
  <section class="py-16 text-center">
    <h6 class="text-sm font-semibold uppercase text-gray-600">Innovate</h6>
    <h2 class="mt-2 text-3xl font-bold text-gray-900">
      Discover the Future of Technology with Us
    </h2>
    <p class="mt-4 text-gray-600 max-w-2xl mx-auto">
      Our products are designed to seamlessly integrate with your daily operations, enhancing efficiency and
      productivity.
      With cutting-edge technology and user-friendly interfaces, we make complex tasks simple.
    </p>

    <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div v-for="(feature, index) in features" :key="index" class="text-center">
        <div class="w-full h-48 bg-gray-300 flex items-center justify-center">
          <span class="text-gray-500">[ Image ]</span>
        </div>
        <h3 class="mt-4 text-xl font-bold text-gray-900">{{ feature.title }}</h3>
        <p class="mt-2 text-gray-600">{{ feature.description }}</p>
      </div>
    </div>

    <div class="mt-8 flex justify-center gap-4">
      <button
        class="px-6 py-2 border border-gray-900 text-gray-900 font-semibold rounded-md hover:bg-gray-900 hover:text-white transition">
        Learn More
      </button>
      <button class="px-6 py-2 text-blue-600 font-semibold rounded-md hover:underline">
        Sign Up &rarr;
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
const features = [
  {
    title: "Unique Features That Set Us Apart",
    description: "Experience unparalleled customization options tailored to your needs."
  },
  {
    title: "Benefits That Transform Your Workflow",
    description: "Boost collaboration and streamline processes with our solutions."
  },
  {
    title: "Join the Revolution in Tech Solutions",
    description: "Our innovative approach empowers teams to excel."
  }
];
</script>
