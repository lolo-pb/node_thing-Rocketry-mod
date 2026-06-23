fn main(@builtin(global_invocation_id) id: vec3u) {
    let R = clamp(i32(round(radius)), 1, 20);
    var result = vec3f(1.0);

    for (var dy = -R; dy <= R; dy += 1) {
        for (var dx = -R; dx <= R; dx += 1) {
            let x = clamp(i32(id.x) + dx, 0, i32(u.width) - 1);
            let y = clamp(i32(id.y) + dy, 0, i32(u.height) - 1);
            let sample_index = u32(x) + u32(y) * u.width;
            result = min(result, raw_input[sample_index]);
        }
    }

    eroded[index] = result;
    opening_radius[index] = f32(R);
}
