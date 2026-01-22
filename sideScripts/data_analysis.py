import statistics

# Hardcoded RGB colors
fiber_samples = [
    (164, 162, 163),
    (149, 149, 151),
    (158, 158, 160),
    (134, 130, 131),
    (140, 134, 134)
]

resin_samples = [
    (53, 54, 59),
    (62, 63, 67),
    (69, 65, 66),
    (61, 57, 56),
    (62, 64, 63)
]

# Calculate luminance for each (L = 0.2126R + 0.7152G + 0.0722B)
fiber_lum = [(0.2126 * r + 0.7152 * g + 0.0722 * b) for r, g, b in fiber_samples]
resin_lum = [(0.2126 * r + 0.7152 * g + 0.0722 * b) for r, g, b in resin_samples]

# Variable data sets (using slices of the luminance list)
sets = {
    "Fibra": fiber_lum,
    "Resina": resin_lum
}

# Output results

for label, data in sets.items():
    avg = statistics.mean(data)
    sd = statistics.stdev(data) if len(data) > 1 else 0
    print(f"{label} -> Mean: {avg:.2f}, Std Dev: {sd:.2f}")


# Last results

#Fibra -> Mean: 147.20, Std Dev: 13.83
#Resina -> Mean: 60.89, Std Dev: 4.80

# Midpoints / threshholding

#17.74 
#    #60.89
#104.05
#    #147.20
#190.36
