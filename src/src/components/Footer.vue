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

const links02 = [
  {
    label: "Privacy Policy",
    href: "#"
  },
  {
    label: "Terms of Use",
    href: "#"
  },
  {
    label: "Cookie Preferences",
    href: "#"
  }
];
</script>

<template>
  <footer class="border-t border-gray-200 py-16 px-16">

    <div class="flex flex-col lg:flex-row mb-16">

      <div class="mx-auto mb-10 lg:mx-0 lg:mb-0">
        <Logo class="bg-linear-to-br from-indigo-900 to-indigo-600 px-4 py-3 rounded-xl" fill="white" />
      </div>

      <nav class="w-full mb-8 md:flex md:justify-center md:items-center md:gap-x-6 lg:mb-0">
        <p v-for="link of links01" class="font-semibold text-center mb-4 md:mb-0">
          <a :href="link.href">{{ link.label }}</a>
        </p>
      </nav>

      <nav class="mx-auto lg:mx-0 flex gap-x-4 items-center">
        <FacebookIcon />
        <InstagramIcon />
        <TwitterIcon />
        <LinkedInIcon />
        <YouTubeIcon />
      </nav>
    </div>

    <div class="lg:flex lg:justify-center lg:gap-x-8">
      <p class="text-gray-500 text-center mb-4 lg:mb-0">
        &copy; 2025 Constelutions. All rights reserved.
      </p>

      <p v-for="link of links02" class="text-gray-500 text-center mb-4 lg:mb-0">
        <a :href="link.href" class="underline">{{ link.label }}</a>
      </p>
    </div>
  </footer>
</template>
