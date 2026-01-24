fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    output[index] = 1 - input;
}
