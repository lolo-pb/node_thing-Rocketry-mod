// CLAHE (approx) in a single pass for this node API.
//
// Matches cv2.createCLAHE(clipLimit=2, tileGridSize=(10,10)) conceptually,
// but implemented without extra histogram/LUT buffers by sampling within each tile.
//
// Key knobs:
// - TILE_X / TILE_Y == tileGridSize
// - BINS == histogram bins (OpenCV uses 256; here we use 64 for speed)
// - SAMPLE_GRID == samples per axis within a tile (8 => 64 samples)

const TILE_X: u32 = 10u;
const TILE_Y: u32 = 10u;

const BINS: u32 = 256u;
const SAMPLE_GRID: u32 = 12u; // 12x12 = 144 samples
const SAMPLES: u32 = SAMPLE_GRID * SAMPLE_GRID;

fn luminance(c: vec3f) -> f32 {
    // Rec.709
    return dot(c, vec3f(0.2126, 0.7152, 0.0722));
}

fn clamp_u32(v: i32, lo: i32, hi: i32) -> u32 {
    return u32(clamp(v, lo, hi));
}

fn load_rgb(px: u32, py: u32) -> vec3f {
    let idx = px + py * u.width;
    return raw_input[idx];
}

// Compute CLAHE mapping for a given tile (tileX,tileY) at a given histogram bin.
// Returns mapped luminance in [0..1].
fn clahe_map_for_tile(tileX: u32, tileY: u32, targetBin: u32, clip_limit: f32) -> f32 {
    var hist: array<u32, 64>; // BINS must be literal for array length in WGSL

    // zero hist
    for (var i: u32 = 0u; i < 64u; i += 1u) {
        hist[i] = 0u;
    }

    // tile bounds in pixel coords
    let tileW = f32(u.width) / f32(TILE_X);
    let tileH = f32(u.height) / f32(TILE_Y);

    let x0f = f32(tileX) * tileW;
    let y0f = f32(tileY) * tileH;
    let x1f = f32(tileX + 1u) * tileW;
    let y1f = f32(tileY + 1u) * tileH;

    // sample a fixed grid inside the tile
    for (var sy: u32 = 0u; sy < SAMPLE_GRID; sy += 1u) {
        for (var sx: u32 = 0u; sx < SAMPLE_GRID; sx += 1u) {
            // center-of-cell sampling
            let fx = (f32(sx) + 0.5) / f32(SAMPLE_GRID);
            let fy = (f32(sy) + 0.5) / f32(SAMPLE_GRID);

            let px = clamp_u32(i32(floor(mix(x0f, x1f, fx))), 0, i32(u.width) - 1);
            let py = clamp_u32(i32(floor(mix(y0f, y1f, fy))), 0, i32(u.height) - 1);

            let lum = clamp(luminance(load_rgb(px, py)), 0.0, 1.0);
            let b = clamp_u32(i32(floor(lum * f32(BINS - 1u) + 0.5)), 0, i32(BINS - 1u));
            hist[b] += 1u;
        }
    }

    // OpenCV-style effective clip threshold:
    // clipThreshold ~= clipLimit * (tileArea / numBins)
    // Here tileArea is SAMPLES (since we're sampling), so:
    // clipThreshold ~= clipLimit * (SAMPLES / BINS)
    // Ensure >= 1
    let clipT = max(1u, u32(floor(clip_limit * (f32(SAMPLES) / f32(BINS)))));

    var excess: u32 = 0u;
    for (var i: u32 = 0u; i < 64u; i += 1u) {
        if (hist[i] > clipT) {
            excess += (hist[i] - clipT);
            hist[i] = clipT;
        }
    }

    // redistribute excess uniformly
    let redist = excess / BINS;
    let rem = excess - redist * BINS;

    for (var i: u32 = 0u; i < 64u; i += 1u) {
        hist[i] += redist;
        if (i < rem) {
            hist[i] += 1u;
        }
    }

    // CDF up to targetBin
    var cdf: u32 = 0u;
    for (var i: u32 = 0u; i <= targetBin; i += 1u) {
        cdf += hist[i];
    }

    // normalize to [0..1]
    return f32(cdf) / f32(SAMPLES);
}

fn main(@builtin(global_invocation_id) id: vec3u) {
    if (id.x >= u.width || id.y >= u.height) {
        return;
    }

    let c = raw_input[index];
    let lum = clamp(luminance(c), 0.0, 1.0);
    let bin = clamp_u32(i32(floor(lum * f32(BINS - 1u) + 0.5)), 0, i32(BINS - 1u));

    // compute continuous tile coordinate in [0..TILE_X) / [0..TILE_Y)
    let tileW = f32(u.width) / f32(TILE_X);
    let tileH = f32(u.height) / f32(TILE_Y);

    var tx = (f32(id.x) + 0.5) / tileW;
    var ty = (f32(id.y) + 0.5) / tileH;

    // clamp BEFORE floor and weights (prevents top/left artifacts)
    tx = clamp(tx, 0.0, f32(TILE_X) - 1e-4);
    ty = clamp(ty, 0.0, f32(TILE_Y) - 1e-4);

    let tx0 = u32(floor(tx));
    let ty0 = u32(floor(ty));
    let tx1 = min(tx0 + 1u, TILE_X - 1u);
    let ty1 = min(ty0 + 1u, TILE_Y - 1u);

    let wx = tx - f32(tx0);
    let wy = ty - f32(ty0);

    let m00 = clahe_map_for_tile(tx0, ty0, bin, clip_limit);
    let m10 = clahe_map_for_tile(tx1, ty0, bin, clip_limit);
    let m01 = clahe_map_for_tile(tx0, ty1, bin, clip_limit);
    let m11 = clahe_map_for_tile(tx1, ty1, bin, clip_limit);

    let mx0 = mix(m00, m10, wx);
    let mx1 = mix(m01, m11, wx);
    let newLum = mix(mx0, mx1, wy);

    // Preserve chroma by scaling RGB by luminance ratio
    var out = c;
    if (lum > 1e-5) {
        out = c * (newLum / lum);
    } else {
        out = vec3f(newLum);
    }

    output[index] = clamp(out, vec3f(0.0), vec3f(1.0));
}
