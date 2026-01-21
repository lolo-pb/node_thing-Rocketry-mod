import { NodeType } from "@/schemas/node.schema";

import absShader from "@/shaders/abs.wgsl";
import addShader from "@/shaders/add.wgsl";
import bayerPatternShader from "@/shaders/bayer-pattern-8x8.wgsl";
import boxBlurShader from "@/shaders/box-blur.wgsl";
import checkersPatternShader from "@/shaders/checker-pattern.wgsl";
import mergeChannelsShader from "@/shaders/combine-channels.wgsl";
import constantShader from "@/shaders/constant.wgsl";
import contrastShader from "@/shaders/contrast.wgsl";
import displaceShader from "@/shaders/displace.wgsl";
import edgeTangentFlowShader from "@/shaders/edge-tangent-flow.wgsl";
import exposureShader from "@/shaders/exposure.wgsl";
import splitChannelsShader from "@/shaders/extract-channel.wgsl";
import fractShader from "@/shaders/fract.wgsl";
import gaussianBlurEdgeShader from "@/shaders/gaussian-blur-edge.wgsl";
import gaussianBlurXShader from "@/shaders/gaussian-blur-x.wgsl";
import gaussianBlurYShader from "@/shaders/gaussian-blur-y.wgsl";
import saturationShader from "@/shaders/saturation.wgsl";
import hslShader from "@/shaders/hsl.wgsl";
import mixShader from "@/shaders/mix.wgsl";
import multiplyShader from "@/shaders/multiply.wgsl";
import pixelateShader from "@/shaders/pixelate.wgsl";
import posterizeShader from "@/shaders/posterize.wgsl";
import radialGradientShader from "@/shaders/radial-gradient.wgsl";
import sharpnessShader from "@/shaders/sharpness.wgsl";
import sineShader from "@/shaders/sine.wgsl";
import sobelShader from "@/shaders/sobel.wgsl";
import thresholdShader from "@/shaders/threshold.wgsl";
import timeShader from "@/shaders/time.wgsl";
import tonemapACESShader from "@/shaders/tone-map-aces.wgsl";
import tonemapHableShader from "@/shaders/tone-map-hable.wgsl";
import tonemapReinhardShader from "@/shaders/tone_map-reinhard.wgsl";
import uvShader from "@/shaders/uv.wgsl";
import whiteNoiseShader from "@/shaders/white-noise.wgsl";
import LGGShader from "@/shaders/LGG.wgsl";
import perlinNoiseShader from "@/shaders/perlin-noise.wgsl";
import voronoiNoiseShader from "@/shaders/voronoi-noise.wgsl";
import voronoiShader from "@/shaders/voronoi.wgsl";
import kuwaharaFilterShader from "@/shaders/kuwahara-filter.wgsl";

export const NODE_TYPES = {
  // Input & output ///////////////////////////////
  __input_image: {
    name: "Image",
    category: "Input",
    tooltip: "Upload an image to be used as input.",
    shader: "",
    inputs: {},
    outputs: {
      color: {
        name: "Color",
        type: "color",
      },
      alpha: {
        name: "Alpha",
        type: "number",
      },
    },
    parameters: {
      image: {
        name: "Image",
        type: "image",
      },
    },
  },
  __input_layer: {
    name: "Underlying layer",
    category: "Input",
    tooltip: "Takes the output of the layer directly below.",
    shader: "",
    inputs: {},
    outputs: {
      color: {
        name: "Color",
        type: "color",
      },
      alpha: {
        name: "Alpha",
        type: "number",
      },
    },
    parameters: {},
  },
  uv: {
    name: "UV",
    category: "Input",
    tooltip:
      "Outputs the relative position of a pixel with respect to the canvas size. U is horizontal and V is vertical. 0 means left/top and 1 means right/bottom.",
    shader: uvShader,
    inputs: {},
    outputs: {
      out_u: {
        name: "U",
        type: "number",
      },
      out_v: {
        name: "V",
        type: "number",
      },
    },
    parameters: {},
  },
  time: {
    name: "Time",
    category: "Input",
    tooltip:
      "Outputs the seconds since the start of the animation. Use the Animation tab for related options.",
    shader: timeShader,
    inputs: {},
    outputs: {
      output: {
        name: "t",
        type: "number",
      },
    },
    parameters: {},
  },
  __output: {
    name: "Output",
    category: "Special",
    tooltip:
      "This is the output node. Whatever you connect here will be seen on the canvas.",
    shader: "",
    inputs: {
      color: {
        name: "Layer output",
        type: "color",
      },
      alpha: {
        name: "Layer alpha",
        type: "number",
      },
    },
    outputs: {},
    parameters: {},
  },
  // Group IO ///////////////////////////////
  __group_input_number: {
    name: "Number input",
    category: "Group",
    shader: "",
    inputs: {},
    outputs: { value: { name: "Value", type: "number" } },
    parameters: { name: { name: "Name", type: "string" } },
  },
  __group_input_color: {
    name: "Color input",
    category: "Group",
    shader: "",
    inputs: {},
    outputs: { value: { name: "Value", type: "color" } },
    parameters: { name: { name: "Name", type: "string" } },
  },
  __group_output_number: {
    name: "Number output",
    category: "Group",
    shader: "",
    inputs: { value: { name: "Value", type: "number" } },
    outputs: {},
    parameters: { name: { name: "Name", type: "string" } },
  },
  __group_output_color: {
    name: "Color output",
    category: "Group",
    shader: "",
    inputs: { value: { name: "Value", type: "color" } },
    outputs: {},
    parameters: { name: { name: "Name", type: "string" } },
  },
  // Generate category ///////////////////////////////
  white_noise: {
    name: "White Noise",
    category: "Generate",
    tooltip: "Outputs a random number between 0 and 1 for every pixel.",
    shader: whiteNoiseShader,
    inputs: {
      seed: {
        name: "seed",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "Noise",
        type: "number",
      },
    },
    parameters: {},
  },
  checkers_Pattern: {
    name: "Checkers Pattern",
    category: "Generate",
    tooltip:
      "Fills the screen with a 2x2 pixel crossed pattern of 0.25 and 0.75. May be used when thresholding and dithering to approximate a range of colors or shades using a limited color palette.",
    shader: checkersPatternShader,
    inputs: {},
    outputs: {
      output: {
        name: "Pattern",
        type: "number",
      },
    },
    parameters: {},
  },
  bayers_Pattern_8x8: {
    name: "Bayers Pattern 8x8",
    category: "Generate",
    tooltip:
      "The 8x8 Bayer pattern intended for dithering (also known as an ordered dither matrix or threshold matrix) is a technique used in computer graphics to approximate a full range of colors or shades using a limited color palette.",
    shader: bayerPatternShader,
    inputs: {},
    outputs: {
      output: {
        name: "Pattern",
        type: "number",
      },
    },
    parameters: {},
  },
  perlin_noise: {
    name: "Perlin noise",
    category: "Generate",
    tooltip:
      "Classic type of procedural gradient noise function used extensively in computer graphics to create natural-looking textures and surfaces. It works by smoothly interpolating values based on random gradient vectors assigned to a grid. The angles may be animated",
    shader: perlinNoiseShader,
    inputs: {
      size: {
        name: "size",
        type: "number",
        min: 2,
        step: 1,
        default: 30,
      },
      t: {
        name: "t",
        type: "number",
      },
      seed: {
        name: "seed",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "Noise",
        type: "number",
      },
    },
    parameters: {},
  },
  // Object category ///////////////////////////////
  radialGradient: {
    name: "Radial Gradient",
    category: "Object",
    tooltip:
      "Generates an elliptical gradient. You can customize its shape and position on the canvas.",
    shader: radialGradientShader,
    inputs: {},
    outputs: {
      output: {
        name: "Gradient",
        type: "number",
      },
    },
    parameters: {},
    uniforms: {
      position: { type: "vec2f", defaultValue: [0, 0] },
      size: { type: "vec2f", defaultValue: [100, 100] },
      angle: { type: "f32", defaultValue: 0 },
      innerRadius: { type: "f32", defaultValue: 0 },
    },
  },
  voronoi_noise: {
    name: "Voronoi noise",
    category: "Generate",
    tooltip:
      "Produces a random pattern of Voronoi cells, outputting a 0 near their centers and 1 along their edges.",
    shader: voronoiNoiseShader,
    inputs: {
      size: {
        name: "size",
        type: "number",
        min: 2,
        step: 1,
        default: 120,
      },
      t: {
        name: "t",
        type: "number",
      },
      seed: {
        name: "seed",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "Noise",
        type: "number",
      },
    },
    parameters: {},
  },
  // Math category ///////////////////////////////
  constant: {
    name: "Constant",
    category: "Math",
    tooltip:
      "Outputs the same number as the input, perfect for organizing nodes that all need the same value for something.",
    shader: constantShader,
    inputs: {
      value: {
        name: "Value",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "k",
        type: "number",
      },
    },
    parameters: {},
  },
  add: {
    name: "Add",
    category: "Math",
    tooltip: "Takes two numbers, outputs their sum.",
    shader: addShader,
    inputs: {
      x: {
        name: "x",
        type: "number",
      },
      y: {
        name: "y",
        type: "number",
      },
    },
    outputs: {
      sum: {
        name: "x + y",
        type: "number",
      },
      dif: {
        name: "x - y",
        type: "number",
      },
    },
    parameters: {},
  },
  multiply: {
    name: "Multiply",
    category: "Math",
    tooltip: "Takes two numbers, outputs their product.",
    shader: multiplyShader,
    inputs: {
      x: {
        name: "x",
        type: "number",
      },
      y: {
        name: "y",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "x × y",
        type: "number",
      },
    },
    parameters: {},
  },
  abs: {
    name: "Absolute value",
    category: "Math",
    tooltip: "Outputs the absolute value of x.",
    shader: absShader,
    inputs: {
      x: {
        name: "x",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "|x|",
        type: "number",
      },
    },
    parameters: {},
  },
  sine: {
    name: "Sine wave",
    category: "Math",
    tooltip:
      "Outputs the sine of t in radians, phase shifted by the given fraction of 2π.",
    shader: sineShader,
    inputs: {
      t: {
        name: "t",
        type: "number",
      },
      phase: {
        name: "Phase",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "Sine",
        type: "number",
      },
    },
    parameters: {},
  },
  fract: {
    name: "Floor/Fract",
    category: "Math",
    tooltip: "Separates the integer and fractional part of x.",
    shader: fractShader,
    inputs: {
      x: {
        name: "x",
        type: "number",
      },
    },
    outputs: {
      integer_part: {
        name: "⌊x⌋",
        type: "number",
      },
      decimal_part: {
        name: "x - ⌊x⌋",
        type: "number",
      },
    },
    parameters: {},
  },
  // Filters category ///////////////////////////////
  boxBlur: {
    name: "Box Blur",
    category: "Filter",
    tooltip:
      "On each pixel, outputs the average color of the 9 neighboring pixels.",
    shader: boxBlurShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      kernel_size: {
        name: "Radius",
        type: "number",
        min: 1,
        max: 50,
        step: 1,
        default: 5,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  gaussBlur: {
    name: "Gaussian blur",
    category: "Filter",
    tooltip:
      "On each pixel, outputs a weighted average of the colors of nearby pixels, following a Gaussian distribution with the given standard deviation.",
    shader: gaussianBlurXShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      std_dev: {
        name: "Std. dev",
        type: "number",
        min: 0.1,
        max: 50,
        step: 0.1,
        default: 5,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
    additionalPasses: [
      {
        shader: gaussianBlurYShader,
        buffers: [
          { name: "inout_image", type: "color" },
          { name: "inout_std_dev", type: "number" },
        ],
      },
    ],
  },
  gaussBlurEdge: {
    name: "Directional blur",
    category: "Filter",
    tooltip:
      "Produces a directional gaussian blur. Uses the input tangent as the direction for each pixel.",
    shader: gaussianBlurEdgeShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      std_dev: {
        name: "Std. dev",
        type: "number",
        min: 0.1,
        max: 50,
        step: 0.1,
        default: 5,
      },
      tangent: {
        name: "Tangent",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  sharpness: {
    name: "Sharpness",
    category: "Filter",
    tooltip:
      "Common sharpening filter operates by enhancing edges and fine details, effectively increasing the contrast between a pixel and its surrounding area to make the resulting image appear clearer and sharper.",
    shader: sharpnessShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  sobel: {
    name: "Sobel",
    category: "Filter",
    tooltip:
      "This code implements Edge Detection by computing the gradient (rate of change in brightness) in both the horizontal and vertical directions. The final output is the combined magnitude of these gradients, effectively highlighting the sharp edges and contours of objects in the image while suppressing uniform areas.",
    shader: sobelShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Gradient",
        type: "color",
      },
    },
    parameters: {},
  },
  // Blend category ///////////////////////////////
  mix: {
    name: "Mix",
    category: "Blend",
    tooltip:
      "Combines the two inputs with a weighted operation. A factor of 0 favors input A, while a factor of 1 favors input B.",
    shader: mixShader,
    inputs: {
      input_a: {
        name: "A",
        type: "color",
      },
      input_b: {
        name: "B",
        type: "color",
      },
      factor: {
        name: "Factor",
        type: "number",
        min: 0,
        max: 1,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {
      mode: {
        name: "Mode",
        type: "select",
        options: [
          "Normal",
          "Multiply",
          "Color Burn",
          "Linear Burn",
          "Darken",
          "Darker color",
          "Add",
          "Screen",
          "Color Dodge",
          "Lighten",
          "Lighter color",
          "Tint",
          "Overlay",
          "Difference",
          "Exclusion",
          "Subtract",
          "Contrast",
        ],
      },
    },
  },
  // Color category ///////////////////////////////
  contrast: {
    name: "Contrast",
    category: "Color",
    tooltip:
      "Increases/decreases the difference in brightness between the different colors in the input.",
    shader: contrastShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      contrast: {
        name: "Contrast",
        type: "number",
        min: 0,
        default: 1,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {
      mode: {
        name: "Mode",
        type: "select",
        options: ["Gamma", "Linear"],
      },
    },
  },
  saturation: {
    name: "Saturation",
    category: "Color",
    tooltip: "Modifies the saturation value of the colors of the input.",
    shader: saturationShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      saturation: {
        name: "Saturation",
        type: "number",
        min: 0,
        default: 1,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  hsl: {
    name: "HSL",
    category: "Color",
    tooltip: "Modifies Hue, Saturation and Luminance.",
    shader: hslShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      angle: {
        name: "Hue Shift",
        type: "number",
        min: 0,
        max: 360,
        step: 1,
        default: 0,
      },
      saturation: {
        name: "Saturation",
        type: "number",
        min: 0,
        default: 1,
      },
      luminance: {
        name: "Luminance",
        type: "number",
        min: -1,
        max: 1,
        default: 0,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  exposure: {
    name: "Exposure",
    category: "Color",
    tooltip:
      "Exposure adjustment filter, this filter brightens or darkens the image by applying a simple, global gamma-like correction based on a user-defined exposure setting. Positive values brighten the image while negative values darken it.",
    shader: exposureShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      ev: {
        name: "EV",
        type: "number",
        min: -5,
        max: 5,
        step: 0.1,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  LGG: {
    name: "Lift gamma gain",
    category: "Color",
    tooltip:
      "The Lift, Gamma, Gain (LGG) controls are fundamental for color grading. Lift adjusts the darkest areas (shadows), effectively adding a constant offset to the output. Gamma controls the mid-tones by applying a power curve, changing the overall perceived brightness without dramatically affecting the pure blacks or pure whites. Gain adjusts the brightest areas (highlights) by multiplying the color values, increasing or decreasing the overall intensity.",
    shader: LGGShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      lift: {
        name: "lift",
        type: "number",
        default: 0.0,
      },
      gamma: {
        name: "gamma",
        type: "number",
        min: 0,
        default: 1.0,
      },
      gain: {
        name: "gain",
        type: "number",
        min: 0,
        default: 1.0,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  // Tonemapping category ///////////////////////////////
  tonemapReinhard: {
    name: "Reinhard",
    category: "Tone mapping",
    tooltip:
      "Reinhard tone mapping is a simple and fast method for compressing High Dynamic Range (HDR) values into the visible Low Dynamic Range (LDR). It works by scaling the input luminance based on its own value, preventing oversaturation and blown-out highlights. A variation of the algorithm allows for a specific white point to be set, giving more control over how bright highlights are preserved and mapped down. It tends to flatten contrast somewhat in very bright areas.",
    shader: tonemapReinhardShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      white: {
        name: "White point",
        type: "number",
        min: 1.0,
        max: 10.0,
        step: 0.1,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  tonemapACES: {
    name: "ACES",
    category: "Tone mapping",
    tooltip:
      "The Academy Color Encoding System (ACES) tone mapper is a sophisticated, industry-standard choice developed for professional film and television production. The ACES curve is a complex, data-driven function designed for wide-gamut and HDR inputs, providing excellent color separation and a highly natural preservation of detail in both shadows and highlights compared to simpler methods.",
    shader: tonemapACESShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  tonemapHable: {
    name: "Hable",
    category: "Tone mapping",
    tooltip:
      "The Hable, tone mapping curve is a cinematic, artist-friendly choice designed to produce an aesthetically pleasing image with good contrast and color preservation. It provides a soft shoulder rolloff in the highlights, avoiding the harsh clipping often seen in simpler mappers, and giving the image a signature look, similar to film. It was allegedly used for the Uncharted 2 game.",
    shader: tonemapHableShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  // Effects category ///////////////////////////////
  threshold: {
    name: "Threshold",
    category: "Effects",
    tooltip:
      "On each pixel, if the perceived brightness exceeds the threshold, outputs white, otherwise outputs black.",
    shader: thresholdShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      threshold: {
        name: "Threshold",
        type: "number",
        min: 0,
        max: 1,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  posterize: {
    name: "Posterize",
    category: "Effects",
    tooltip: "Limits the range of colors that are outputted.",
    shader: posterizeShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      steps: {
        name: "Steps",
        type: "number",
        min: 2,
        max: 16,
        step: 1,
        default: 4,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  pixelate: {
    name: "Pixelate",
    category: "Effects",
    tooltip: "Through down-sampling, reduces the resolution of the input.",
    shader: pixelateShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      kernel_size: {
        name: "Radius",
        type: "number",
        min: 2,
        max: 64,
        step: 1,
        default: 8,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  displace: {
    name: "Displace",
    category: "Effects",
    tooltip:
      "Moves the input x pixels horizontally and y pixels vertically. Wrapping mode affects the behavior of pixels that go offscreen.",
    shader: displaceShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      x: {
        name: "x",
        type: "number",
        step: 1,
      },
      y: {
        name: "y",
        type: "number",
        step: 1,
      },
      fallback_input: {
        name: "Fallback",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {
      mode: {
        name: "Wrapping mode",
        type: "select",
        options: ["Repeat", "Mirror", "Clamp", "Fallback"],
      },
    },
  },
  voronoi: {
    name: "Voronoi filter",
    category: "Effects",
    tooltip:
      "Divides the input into Voronoi cells, each with their own color, based on the original color of nearby pixels.",
    shader: voronoiShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      size: {
        name: "size",
        type: "number",
        default: 2,
        min: 2,
        step: 1,
      },
      t: {
        name: "t",
        type: "number",
      },
      seed: {
        name: "seed",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  kuwahara: {
    name: "Kuwahara filter",
    category: "Effects",
    tooltip:
      "Creates a painting-like effect by reducing noise without blurring the edges.",
    shader: kuwaharaFilterShader,
    inputs: {
      input: {
        name: "Input",
        type: "color",
      },
      R: {
        name: "R",
        type: "number",
        min: 0.0,
        step: 1.0,
        default: 5.0,
        max: 20.0,
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  // Utility category ///////////////////////////////
  split_channels: {
    name: "Split channels",
    category: "Utility",
    tooltip:
      "Separates the RGB values of the input, 0 being the minimum and 1 being the maximum.",
    shader: splitChannelsShader,
    inputs: {
      input: {
        name: "Color",
        type: "color",
      },
    },
    outputs: {
      red: {
        name: "R",
        type: "number",
      },
      green: {
        name: "G",
        type: "number",
      },
      blue: {
        name: "B",
        type: "number",
      },
    },
    parameters: {},
  },
  merge_channels: {
    name: "Merge channels",
    category: "Utility",
    tooltip: "Combines RGB values into an output color.",
    shader: mergeChannelsShader,
    inputs: {
      red: {
        name: "R",
        type: "number",
      },
      green: {
        name: "G",
        type: "number",
      },
      blue: {
        name: "B",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "Color",
        type: "color",
      },
    },
    parameters: {},
  },
  edge_tangent_flow: {
    name: "Edge Tangent Flow",
    category: "Utility",
    tooltip:
      "Outputs the local tangent direction of the edges in the input as a normalized 2D vector, with red and green being the x and y components respectively.",
    shader: edgeTangentFlowShader,
    inputs: {
      gradient: {
        name: "Gradient",
        type: "color",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
} satisfies Record<string, NodeType>;

export const NODE_TYPE_NAMES = Object.keys(
  NODE_TYPES,
) as (keyof typeof NODE_TYPES)[];
