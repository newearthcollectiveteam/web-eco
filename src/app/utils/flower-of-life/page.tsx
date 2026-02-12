"use client";

import { ShadertoyRenderer } from "~/components/shaders/shadertoy-renderer";

export default function FlowerOfLifeUtilityPage() {
  return (
    <div className="h-screen w-screen">
      <ShadertoyRenderer
        fragmentShader={`
// Flower of Life - Sacred Geometry
// Inspired by ancient symbolism and mathematical beauty

#define PI 3.14159265359
#define TWO_PI 6.28318530718

// Color palette for sacred geometry
vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.0, 0.33, 0.67);
    return a + b * cos(TWO_PI * (c * t + d));
}

// Draw a circle
float circle(vec2 uv, vec2 center, float radius) {
    float dist = length(uv - center);
    return smoothstep(radius + 0.01, radius - 0.01, dist);
}

// Draw circle outline only
float circleOutline(vec2 uv, vec2 center, float radius, float thickness) {
    float dist = length(uv - center);
    float outer = smoothstep(radius + thickness + 0.005, radius + thickness - 0.005, dist);
    float inner = smoothstep(radius - thickness + 0.005, radius - thickness - 0.005, dist);
    return outer - inner;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalized pixel coordinates (from -1 to 1)
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);

    // Time-based rotation
    float time = iTime * 0.15;
    float angle = time;
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    uv = rot * uv;

    // Initialize color
    vec3 col = vec3(0.0);

    // Flower of Life parameters
    float radius = 0.25;
    float thickness = 0.015;

    // Center circle
    vec2 center = vec2(0.0, 0.0);
    float pattern = circleOutline(uv, center, radius, thickness);

    // Six surrounding circles (hexagonal pattern)
    for (int i = 0; i < 6; i++) {
        float angle = float(i) * PI / 3.0;
        vec2 offset = vec2(cos(angle), sin(angle)) * radius;
        pattern += circleOutline(uv, center + offset, radius, thickness);
    }

    // Second ring (12 circles)
    for (int i = 0; i < 6; i++) {
        float angle = float(i) * PI / 3.0;
        vec2 offset1 = vec2(cos(angle), sin(angle)) * radius * 2.0;
        pattern += circleOutline(uv, center + offset1, radius, thickness);

        // In-between circles
        float angle2 = float(i) * PI / 3.0 + PI / 6.0;
        vec2 offset2 = vec2(cos(angle2), sin(angle2)) * radius * sqrt(3.0);
        pattern += circleOutline(uv, center + offset2, radius, thickness);
    }

    // Pulsing color based on time and distance from center
    float dist = length(uv);
    float colorTime = time * 0.5 + dist * 2.0;
    vec3 color1 = palette(colorTime);
    vec3 color2 = palette(colorTime + 0.5);

    // Mix colors based on pattern
    col = mix(color2 * 0.1, color1, pattern);

    // Add glow
    float glow = exp(-dist * 2.0) * 0.3;
    col += glow * color1;

    // Vignette
    col *= 0.5 + 0.5 * pow(16.0 * fragCoord.x * fragCoord.y * (1.0 - fragCoord.x) * (1.0 - fragCoord.y) / (iResolution.x * iResolution.y), 0.3);

    fragColor = vec4(col, 1.0);
}
        `}
        className="h-full w-full"
      />
    </div>
  );
}
