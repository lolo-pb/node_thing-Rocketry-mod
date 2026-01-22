fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    sum[index] = x + y;
    sub[index] = x - y;
    dif[index] = abs(x - y);
    
}
