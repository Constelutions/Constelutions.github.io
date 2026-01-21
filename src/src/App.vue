<script setup lang="ts">
import GetInTouchSection from './components/GetInTouchSection.vue';
import WelcomeSection from './components/WelcomeSection.vue';
import Footer from './components/Footer.vue';
import ProductsSection from './components/ProductsSection.vue';
import Hero from './components/Hero.vue';
import ParticleBackground from './components/ParticleBackground.vue';
</script>

<template>
  <ParticleBackground>
    <Hero />

    <WelcomeSection />

    <ProductsSection />

    <GetInTouchSection />

    <Footer />
  </ParticleBackground>
</template>
