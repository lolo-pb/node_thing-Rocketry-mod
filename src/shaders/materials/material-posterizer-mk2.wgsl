const LUMA = vec3f(0.2126, 0.7152, 0.0722);

fn main(@builtin(global_invocation_id) id: vec3u) {
    let R = clamp(i32(round(radius)), 1, 8);

    var sum = 0.0;
    var sum_squared = 0.0;
    var sample_count = 0.0;

    for (var dy = -R; dy <= R; dy += 1) {
        for (var dx = -R; dx <= R; dx += 1) {
            let x = clamp(i32(id.x) + dx, 0, i32(u.width) - 1);
            let y = clamp(i32(id.y) + dy, 0, i32(u.height) - 1);
            let sample_index = u32(x) + u32(y) * u.width;
            let sample_luminance = dot(raw_input[sample_index], LUMA);

            sum += sample_luminance;
            sum_squared += sample_luminance * sample_luminance;
            sample_count += 1.0;
        }
    }

    let local_mean = sum / sample_count;
    let local_variance = max(sum_squared / sample_count - local_mean * local_mean, 0.0);
    let current_luminance = dot(input, LUMA);
    let difference = current_luminance - local_mean;

    let pore_limit = max(pore_darkness, 0.0);
    let fiber_limit = max(fiber_brightness, 0.0);
    let ambiguity = max(confidence, 0.0);

    var result = vec3f(0.0);

    if (local_variance < max(minimum_contrast, 0.0)) {
        result = vec3f(0.0, 1.0, 0.0);
    } else if (difference <= -(pore_limit + ambiguity)) {
        result = vec3f(0.0, 0.0, 1.0);
    } else if (difference >= fiber_limit + ambiguity) {
        result = vec3f(1.0, 0.0, 0.0);
    } else if (
        difference >= -pore_limit + ambiguity &&
        difference <= fiber_limit - ambiguity
    ) {
        result = vec3f(0.0, 1.0, 0.0);
    }

    output[index] = result;
}
