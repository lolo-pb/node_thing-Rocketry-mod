const LUMA = vec3f(0.2126, 0.7152, 0.0722);

fn main(@builtin(global_invocation_id) id: vec3u) {
    let lower_threshold = min(pore_threshold, fiber_threshold);
    let upper_threshold = max(pore_threshold, fiber_threshold);
    let luminance = dot(input, LUMA);

    if (luminance < lower_threshold) {
        output[index] = vec3f(0.0, 0.0, 1.0);
    } else if (luminance < upper_threshold) {
        output[index] = vec3f(0.0, 1.0, 0.0);
    } else {
        output[index] = vec3f(1.0, 0.0, 0.0);
    }
}
