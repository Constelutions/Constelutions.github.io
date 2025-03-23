<script setup lang="ts">
import FeatureSection from './components/FeatureSection.vue';
import GetInTouchSection from './components/GetInTouchSection.vue';
import Testimonial from './components/Testimonial.vue';
import WelcomeSection from './components/WelcomeSection.vue';
import Footer from './components/Footer.vue';
import ProductsSection from './components/ProductsSection.vue';
import NavBar from './components/NavBar.vue';
import Hero from './components/Hero.vue';
import Logo from './components/Logo.vue';
</script>

<template>
  <!-- <div class="min-h-screen bg-gray-900 text-white">
    <NavBar />
  </div> -->
  <Hero />

  <WelcomeSection />

  <FeatureSection />

  <ProductsSection />

  <Testimonial />

  <GetInTouchSection class="mb-6" />

  <Footer />
</template>
