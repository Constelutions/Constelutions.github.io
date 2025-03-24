<script setup lang="ts">
import Logo from './Logo.vue';
import Tesseract from './Tesseract.vue';

const options = {
  "autoPlay": true,
  "background": {
    "color": {
      "value": "#101828"
    },
    "image": "",
    "position": "",
    "repeat": "",
    "size": "",
    "opacity": 1
  },
  "backgroundMask": {
    "composite": "destination-out",
    "cover": {
      "opacity": 1,
      "color": {
        "value": ""
      }
    },
    "enable": false
  },
  "clear": true,
  "defaultThemes": {},
  "delay": 0,
  "fullScreen": {
    "enable": false,
    "zIndex": -1
  },
  "detectRetina": true,
  "duration": 0,
  "fpsLimit": 120,
  "interactivity": {
    "detectsOn": "window",
    "events": {
      "onClick": {
        "enable": false,
        "mode": []
      },
      "onDiv": {
        "selectors": [],
        "enable": false,
        "mode": [],
        "type": "circle"
      },
      "onHover": {
        "enable": false,
        "mode": [],
        "parallax": {
          "enable": false,
          "force": 2,
          "smooth": 10
        }
      },
      "resize": {
        "delay": 0.5,
        "enable": true
      }
    },
    "modes": {
      "trail": {
        "delay": 1,
        "pauseOnStop": false,
        "quantity": 1
      },
      "attract": {
        "distance": 200,
        "duration": 0.4,
        "easing": "ease-out-quad",
        "factor": 1,
        "maxSpeed": 50,
        "speed": 1
      },
      "bounce": {
        "distance": 200
      },
      "bubble": {
        "distance": 200,
        "duration": 0.4,
        "mix": false,
        "divs": {
          "distance": 200,
          "duration": 0.4,
          "mix": false,
          "selectors": []
        }
      },
      "connect": {
        "distance": 80,
        "links": {
          "opacity": 0.5
        },
        "radius": 60
      },
      "grab": {
        "distance": 100,
        "links": {
          "blink": false,
          "consent": false,
          "opacity": 1
        }
      },
      "push": {
        "default": true,
        "groups": [],
        "quantity": 4
      },
      "remove": {
        "quantity": 2
      },
      "repulse": {
        "distance": 200,
        "duration": 0.4,
        "factor": 100,
        "speed": 1,
        "maxSpeed": 50,
        "easing": "ease-out-quad",
        "divs": {
          "distance": 200,
          "duration": 0.4,
          "factor": 100,
          "speed": 1,
          "maxSpeed": 50,
          "easing": "ease-out-quad",
          "selectors": []
        }
      },
      "slow": {
        "factor": 3,
        "radius": 200
      },
      "particle": {
        "replaceCursor": false,
        "pauseOnStop": false,
        "stopDelay": 0
      },
      "light": {
        "area": {
          "gradient": {
            "start": {
              "value": "#ffffff"
            },
            "stop": {
              "value": "#000000"
            }
          },
          "radius": 1000
        },
        "shadow": {
          "color": {
            "value": "#000000"
          },
          "length": 2000
        }
      }
    }
  },
  "manualParticles": [],
  "particles": {
    "bounce": {
      "horizontal": {
        "value": 1
      },
      "vertical": {
        "value": 1
      }
    },
    "collisions": {
      "absorb": {
        "speed": 2
      },
      "bounce": {
        "horizontal": {
          "value": 1
        },
        "vertical": {
          "value": 1
        }
      },
      "enable": false,
      "maxSpeed": 50,
      "mode": "bounce",
      "overlap": {
        "enable": true,
        "retries": 0
      }
    },
    "color": {
      "value": "#ffffff",
      "animation": {
        "h": {
          "count": 0,
          "enable": false,
          "speed": 1,
          "decay": 0,
          "delay": 0,
          "sync": true,
          "offset": 0
        },
        "s": {
          "count": 0,
          "enable": false,
          "speed": 1,
          "decay": 0,
          "delay": 0,
          "sync": true,
          "offset": 0
        },
        "l": {
          "count": 0,
          "enable": false,
          "speed": 1,
          "decay": 0,
          "delay": 0,
          "sync": true,
          "offset": 0
        }
      }
    },
    "effect": {
      "close": true,
      "fill": true,
      "options": {},
      "type": []
    },
    "groups": {},
    "move": {
      "angle": {
        "offset": 0,
        "value": 90
      },
      "attract": {
        "distance": 200,
        "enable": false,
        "rotate": {
          "x": 3000,
          "y": 3000
        }
      },
      "center": {
        "x": 50,
        "y": 50,
        "mode": "percent",
        "radius": 0
      },
      "decay": 0,
      "distance": {},
      "direction": "top",
      "drift": 0,
      "enable": true,
      "gravity": {
        "acceleration": 9.81,
        "enable": false,
        "inverse": false,
        "maxSpeed": 50
      },
      "path": {
        "clamp": false,
        "delay": {
          "value": 0
        },
        "enable": false,
        "options": {}
      },
      "outModes": {
        "default": "out",
        "bottom": "out",
        "left": "out",
        "right": "out",
        "top": "out"
      },
      "random": true,
      "size": true,
      "speed": 2,
      "spin": {
        "acceleration": 0,
        "enable": false
      },
      "straight": false,
      "trail": {
        "enable": false,
        "length": 10,
        "fill": {}
      },
      "vibrate": false,
      "warp": false
    },
    "number": {
      "density": {
        "enable": false,
        "width": 1920,
        "height": 1080
      },
      "limit": {
        "mode": "delete",
        "value": 0
      },
      "value": 200
    },
    "opacity": {
      "value": 0.25,
      "animation": {
        "count": 0,
        "enable": true,
        "speed": 0.25,
        "decay": 0,
        "delay": 0,
        "sync": false,
        "mode": "auto",
        "startValue": "random",
        "destroy": "none"
      }
    },
    "reduceDuplicates": false,
    "shadow": {
      "blur": 0,
      "color": {
        "value": "#000"
      },
      "enable": false,
      "offset": {
        "x": 0,
        "y": 0
      }
    },
    "shape": {
      "close": true,
      "fill": true,
      "options": {},
      "type": "circle"
    },
    "size": {
      "value": 3,
      "animation": {
        "count": 0,
        "enable": false,
        "speed": 5,
        "decay": 0,
        "delay": 0,
        "sync": false,
        "mode": "auto",
        "startValue": "random",
        "destroy": "none"
      }
    },
    "stroke": {
      "width": 0,
      "color": {
        "value": "#ffffff",
        "animation": {
          "h": {
            "count": 0,
            "enable": false,
            "speed": 1,
            "decay": 0,
            "delay": 0,
            "sync": true,
            "offset": 0
          },
          "s": {
            "count": 0,
            "enable": false,
            "speed": 1,
            "decay": 0,
            "delay": 0,
            "sync": true,
            "offset": 0
          },
          "l": {
            "count": 0,
            "enable": false,
            "speed": 1,
            "decay": 0,
            "delay": 0,
            "sync": true,
            "offset": 0
          }
        }
      },
      "opacity": 1
    },
    "zIndex": {
      "value": 0,
      "opacityRate": 1,
      "sizeRate": 1,
      "velocityRate": 1
    },
    "destroy": {
      "bounds": {},
      "mode": "none",
      "split": {
        "count": 1,
        "factor": {
          "value": 3
        },
        "rate": {
          "value": {
            "min": 4,
            "max": 9
          }
        },
        "sizeOffset": true,
        "particles": {}
      }
    },
    "roll": {
      "darken": {
        "enable": false,
        "value": 0
      },
      "enable": false,
      "enlighten": {
        "enable": false,
        "value": 0
      },
      "mode": "vertical",
      "speed": 25
    },
    "tilt": {
      "value": 0,
      "animation": {
        "enable": false,
        "speed": 0,
        "decay": 0,
        "sync": false
      },
      "direction": "clockwise",
      "enable": false
    },
    "twinkle": {
      "lines": {
        "enable": false,
        "frequency": 0.05,
        "opacity": 1
      },
      "particles": {
        "enable": false,
        "frequency": 0.05,
        "opacity": 1
      }
    },
    "wobble": {
      "distance": 5,
      "enable": false,
      "speed": {
        "angle": 50,
        "move": 10
      }
    },
    "life": {
      "count": 0,
      "delay": {
        "value": 0,
        "sync": false
      },
      "duration": {
        "value": 0,
        "sync": false
      }
    },
    "rotate": {
      "value": 0,
      "animation": {
        "enable": false,
        "speed": 0,
        "decay": 0,
        "sync": false
      },
      "direction": "clockwise",
      "path": false
    },
    "orbit": {
      "animation": {
        "count": 0,
        "enable": false,
        "speed": 1,
        "decay": 0,
        "delay": 0,
        "sync": false
      },
      "enable": false,
      "opacity": 1,
      "rotation": {
        "value": 45
      },
      "width": 1
    },
    "links": {
      "blink": false,
      "color": {
        "value": "#fff"
      },
      "consent": false,
      "distance": 100,
      "enable": false,
      "frequency": 1,
      "opacity": 1,
      "shadow": {
        "blur": 5,
        "color": {
          "value": "#000"
        },
        "enable": false
      },
      "triangles": {
        "enable": false,
        "frequency": 1
      },
      "width": 1,
      "warp": false
    },
    "repulse": {
      "value": 0,
      "enabled": false,
      "distance": 1,
      "duration": 1,
      "factor": 1,
      "speed": 1
    }
  },
  "pauseOnBlur": true,
  "pauseOnOutsideViewport": true,
  "responsive": [],
  "smooth": false,
  "style": {},
  "themes": [],
  "zLayers": 100,
  "emitters": [],
  "motion": {
    "disable": false,
    "reduce": {
      "factor": 4,
      "value": true
    }
  }
};
</script>

<template>
  <div class="text-white h-screen relative flex justify-center items-center overflow-hidden">

    <vue-particles id="particlesBackground" :options
      class="absolute top-0 left-0 w-screen h-screen z-1"></vue-particles>

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
