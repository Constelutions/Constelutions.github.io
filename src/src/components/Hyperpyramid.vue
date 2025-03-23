<template>
  <div class="scene">
    <div class="hyperpyramid">
      <div v-for="(face, index) in faces" :key="index" class="face" :style="face.style"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const faces = ref([
  { style: 'transform: rotateY(0deg) translateZ(50px);' },
  { style: 'transform: rotateY(90deg) translateZ(50px);' },
  { style: 'transform: rotateY(180deg) translateZ(50px);' },
  { style: 'transform: rotateY(-90deg) translateZ(50px);' },
  { style: 'transform: rotateX(90deg) translateZ(50px);' }
]);

onMounted(() => {
  document.querySelector('.hyperpyramid').style.animation = 'rotate 5s linear infinite';
});
</script>

<style scoped>
.scene {
  display: flex;
  justify-content: center;
  align-items: center;
  /* height: 100vh; */
  /* background-color: black; */
  perspective: 800px;
  /* NOTE: changing this value shows interesting animations */
}

.hyperpyramid {
  position: relative;
  width: 100px;
  height: 100px;
  transform-style: preserve-3d;
  animation: rotate 5s linear infinite;
}

.face {
  position: absolute;
  width: 100px;
  height: 100px;
  background: rgba(0, 255, 255, 0.3);
  border: 1px solid cyan;
}

@keyframes rotate {
  from {
    transform: rotateX(0deg) rotateY(0deg);
  }

  to {
    transform: rotateX(360deg) rotateY(360deg);
  }
}
</style>
