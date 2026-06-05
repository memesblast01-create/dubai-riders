"""
Dubai Riders — Master Blender Asset Export Script
Run with: blender --background --python scripts/export_all_models.py

Generates production-ready GLB files for all four delivery brand bikes + riders.
Uses procedural modeling — no external dependencies required.
"""

import bpy
import math
import os
import sys

# Output directory
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "models")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ─── UTILITY FUNCTIONS ──────────────────────────────────────────────────────

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for col in bpy.data.collections:
        bpy.data.collections.remove(col)

def new_material(name, color, roughness=0.3, metallic=0.8, emissive=(0,0,0), emissive_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    if emissive_strength > 0:
        bsdf.inputs['Emission'].default_value = (*emissive, 1.0)
        bsdf.inputs['Emission Strength'].default_value = emissive_strength
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat

def add_cube(name, location, scale, material=None, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    if bevel > 0:
        bpy.ops.object.modifier_add(type='BEVEL')
        obj.modifiers['Bevel'].width = bevel
        obj.modifiers['Bevel'].segments = 3
        bpy.ops.object.modifier_apply(modifier='Bevel')
    if material:
        if obj.data.materials:
            obj.data.materials[0] = material
        else:
            obj.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    return obj

def add_cylinder(name, location, radius, depth, rotation=(0,0,0), material=None, vertices=24):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices, radius=radius, depth=depth,
        location=location, rotation=rotation
    )
    obj = bpy.context.active_object
    obj.name = name
    if material:
        if obj.data.materials:
            obj.data.materials[0] = material
        else:
            obj.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    return obj

def add_sphere(name, location, radius, material=None):
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=radius, location=location, segments=24, ring_count=16
    )
    obj = bpy.context.active_object
    obj.name = name
    if material:
        if obj.data.materials:
            obj.data.materials[0] = material
        else:
            obj.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    return obj

def add_torus(name, location, major_r, minor_r, material=None):
    bpy.ops.mesh.primitive_torus_add(
        location=location,
        major_radius=major_r,
        minor_radius=minor_r,
        major_segments=32,
        minor_segments=16
    )
    obj = bpy.context.active_object
    obj.name = name
    if material:
        if obj.data.materials:
            obj.data.materials[0] = material
        else:
            obj.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    return obj

def export_glb(filepath, selected_only=True):
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=selected_only,
        export_apply=True,
        export_materials='EXPORT',
        export_colors=True,
        export_cameras=False,
        export_lights=False,
        export_normals=True,
        export_tangents=True,
        export_texcoords=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
    )
    print(f"  ✓ Exported: {filepath}")

def join_selected():
    bpy.ops.object.join()
    return bpy.context.active_object

def select_all_objects(obj_list):
    bpy.ops.object.select_all(action='DESELECT')
    for o in obj_list:
        if o and o.name in bpy.data.objects:
            o.select_set(True)
    if obj_list:
        bpy.context.view_layer.objects.active = obj_list[0]

# ─── WHEEL BUILDER ──────────────────────────────────────────────────────────

def build_wheel(prefix, location, brand_color):
    objects = []

    tire_mat = new_material(f"{prefix}_tire", (0.04, 0.04, 0.04), roughness=0.95, metallic=0.0)
    rim_mat  = new_material(f"{prefix}_rim", (0.8, 0.8, 0.8), roughness=0.08, metallic=1.0)
    brake_mat= new_material(f"{prefix}_brake", (0.15, 0.15, 0.15), roughness=0.5, metallic=0.85)

    # Tire (torus)
    tire = add_torus(f"{prefix}_tire", location, major_r=0.38, minor_r=0.1, material=tire_mat)
    tire.rotation_euler[0] = math.pi / 2
    objects.append(tire)

    # Rim
    rim = add_cylinder(f"{prefix}_rim", location, radius=0.275, depth=0.09,
                       rotation=(math.pi/2, 0, 0), material=rim_mat)
    objects.append(rim)

    # Hub
    hub = add_cylinder(f"{prefix}_hub", location, radius=0.065, depth=0.13,
                       rotation=(math.pi/2, 0, 0),
                       material=new_material(f"{prefix}_hub_mat", (0.1,0.1,0.1), roughness=0.4, metallic=0.9))
    objects.append(hub)

    # Spokes × 6
    for i in range(6):
        angle = (i / 6) * math.pi * 2
        spoke_loc = (
            location[0],
            location[1] + math.sin(angle) * 0.0,
            location[2]
        )
        spoke = add_cube(f"{prefix}_spoke_{i}",
                         (location[0], location[1], location[2]),
                         (0.016, 0.55, 0.012),
                         material=rim_mat)
        spoke.rotation_euler[1] = math.pi / 2  # along axle
        spoke.rotation_euler[2] = angle
        objects.append(spoke)

    # Brake disc
    brake = add_cylinder(f"{prefix}_brake", location,
                         radius=0.22, depth=0.016,
                         rotation=(math.pi/2, 0, 0), material=brake_mat)
    # offset to one side
    brake.location[0] += 0.055
    objects.append(brake)

    return objects

# ─── BIKE BUILDER ────────────────────────────────────────────────────────────

def build_bike(brand_key, primary_color, box_logo_color=(1,1,1)):
    print(f"\n Building bike: {brand_key}")
    all_objs = []

    # Materials
    paint_mat   = new_material(f"{brand_key}_paint",   primary_color, roughness=0.18, metallic=0.88)
    chrome_mat  = new_material(f"{brand_key}_chrome",  (0.8,0.8,0.8), roughness=0.06, metallic=1.0)
    dark_mat    = new_material(f"{brand_key}_dark",    (0.06,0.06,0.06), roughness=0.55, metallic=0.3)
    glass_mat   = new_material(f"{brand_key}_glass",   (0.5,0.7,0.9), roughness=0.02, metallic=0.0)
    rubber_mat  = new_material(f"{brand_key}_rubber",  (0.06,0.06,0.06), roughness=0.92, metallic=0.0)
    box_mat     = new_material(f"{brand_key}_box",     primary_color, roughness=0.62, metallic=0.1)
    headl_mat   = new_material(f"{brand_key}_headlight",(1,0.98,0.85), roughness=0.02, metallic=0.1,
                               emissive=(1,0.95,0.7), emissive_strength=8.0)
    tail_mat    = new_material(f"{brand_key}_tail",    (0.9,0.05,0.0), roughness=0.1, metallic=0.1,
                               emissive=(1,0.1,0.0), emissive_strength=4.0)
    decal_mat   = new_material(f"{brand_key}_decal",   box_logo_color, roughness=0.9, metallic=0.0,
                               emissive=primary_color, emissive_strength=1.2)

    # ── WHEELS ──
    fw_objs = build_wheel(f"{brand_key}_fw", (1.28, 0, 0.39), primary_color)
    rw_objs = build_wheel(f"{brand_key}_rw", (-1.08, 0, 0.39), primary_color)
    all_objs.extend(fw_objs + rw_objs)

    # ── FRONT FORKS ──
    for sx in [-0.19, 0.19]:
        fork = add_cylinder(f"{brand_key}_fork_{sx}", (1.1+sx*0.0, sx, 0.82),
                            radius=0.03, depth=0.92,
                            rotation=(0.18, 0, 0), material=chrome_mat)
        all_objs.append(fork)

    # ── SWINGARM ──
    for sx in [-0.14, 0.14]:
        arm = add_cylinder(f"{brand_key}_arm_{sx}", (-0.7, sx, 0.65),
                           radius=0.024, depth=0.88,
                           rotation=(0, 0, 0.15), material=chrome_mat)
        all_objs.append(arm)

    # Shock absorber
    shock = add_cylinder(f"{brand_key}_shock", (-0.7, 0, 0.82), radius=0.034, depth=0.5,
                         rotation=(0,0,0), material=new_material(f"{brand_key}_spring",
                         (0.85, 0.72, 0.0), roughness=0.55, metallic=0.3))
    all_objs.append(shock)

    # ── MAIN FAIRING (body) ──
    body = add_cube(f"{brand_key}_body", (0, 0, 0.95), (0.60, 2.55, 0.72),
                    material=paint_mat, bevel=0.04)
    all_objs.append(body)

    # Upper fairing
    upper = add_cube(f"{brand_key}_upper", (0, 0.58, 1.3), (0.52, 0.9, 0.42),
                     material=paint_mat, bevel=0.03)
    all_objs.append(upper)

    # Tank
    tank = add_cube(f"{brand_key}_tank", (0, 0.2, 1.32), (0.40, 0.8, 0.38),
                    material=paint_mat, bevel=0.04)
    all_objs.append(tank)

    # ── NOSE COWL ──
    nose = add_cylinder(f"{brand_key}_nose", (0, 1.35, 1.0),
                        radius=0.24, depth=0.48,
                        rotation=(-0.22 + math.pi/2, 0, 0), material=paint_mat, vertices=14)
    all_objs.append(nose)

    # ── WINDSCREEN ──
    wind = add_cube(f"{brand_key}_wind", (0, 1.08, 1.62), (0.44, 0.025, 0.38),
                    material=glass_mat)
    wind.rotation_euler[0] = -0.52
    all_objs.append(wind)

    # ── ENGINE ──
    engine = add_cube(f"{brand_key}_engine", (0, 0.12, 0.68), (0.52, 0.7, 0.48),
                      material=dark_mat, bevel=0.025)
    all_objs.append(engine)

    # ── SEAT ──
    seat = add_cube(f"{brand_key}_seat", (0, -0.32, 1.32), (0.36, 0.88, 0.07),
                    material=new_material(f"{brand_key}_seat_mat", (0.07,0.07,0.07), roughness=0.88, metallic=0.04),
                    bevel=0.02)
    all_objs.append(seat)

    # ── HANDLEBARS ──
    bar = add_cylinder(f"{brand_key}_bar", (0, 0.88, 1.48),
                       radius=0.022, depth=0.70,
                       rotation=(0, math.pi/2, 0), material=chrome_mat)
    all_objs.append(bar)

    for sx in [-0.36, 0.36]:
        grip = add_cylinder(f"{brand_key}_grip_{sx}", (sx, 0.88, 1.48),
                            radius=0.031, depth=0.14,
                            rotation=(0, math.pi/2, 0), material=rubber_mat)
        all_objs.append(grip)

    # Mirrors
    for sx in [-0.42, 0.42]:
        mstalk = add_cylinder(f"{brand_key}_mstalk_{sx}", (sx, 0.82, 1.54),
                              radius=0.008, depth=0.14, material=chrome_mat)
        mirror = add_cube(f"{brand_key}_mirror_{sx}", (sx, 0.76, 1.64),
                          (0.09, 0.012, 0.06), material=dark_mat)
        all_objs.extend([mstalk, mirror])

    # ── HEADLIGHT ──
    hl_housing = add_cylinder(f"{brand_key}_hl_housing", (0, 1.52, 1.08),
                              radius=0.17, depth=0.11,
                              rotation=(math.pi/2, 0, 0),
                              material=dark_mat, vertices=16)
    hl_lens = add_cylinder(f"{brand_key}_hl_lens", (0, 1.56, 1.08),
                           radius=0.12, depth=0.05,
                           rotation=(math.pi/2, 0, 0),
                           material=headl_mat, vertices=16)
    # DRL strips
    for sx in [-0.1, 0.1]:
        drl = add_cube(f"{brand_key}_drl_{sx}", (sx, 1.54, 1.14),
                       (0.08, 0.01, 0.012),
                       material=new_material(f"{brand_key}_drl_mat", (0.7,0.85,1.0),
                                             roughness=0.8, metallic=0,
                                             emissive=(0.5,0.8,1.0), emissive_strength=5.0))
        all_objs.append(drl)
    all_objs.extend([hl_housing, hl_lens])

    # ── TAILLIGHT ──
    tail = add_cube(f"{brand_key}_tail", (0, -1.34, 0.96), (0.32, 0.02, 0.07),
                    material=tail_mat)
    all_objs.append(tail)

    # ── EXHAUST ──
    exhaust = add_cylinder(f"{brand_key}_exhaust", (0.22, -0.55, 0.52),
                           radius=0.048, depth=1.12,
                           rotation=(0, 0, 0.18), material=chrome_mat)
    exhaust_tip = add_cylinder(f"{brand_key}_exhaust_tip", (0.3, -1.05, 0.44),
                               radius=0.055, depth=0.16,
                               rotation=(0, 0, 0.18), material=chrome_mat)
    all_objs.extend([exhaust, exhaust_tip])

    # ── FOOTPEGS ──
    for sx in [-0.28, 0.28]:
        peg = add_cube(f"{brand_key}_peg_{sx}", (sx, 0.15, 0.55), (0.08, 0.2, 0.022),
                       material=chrome_mat)
        all_objs.append(peg)

    # ── SIDE PANELS ──
    for sx in [-0.32, 0.32]:
        panel = add_cube(f"{brand_key}_panel_{sx}", (sx, 0.0, 0.9), (0.06, 2.2, 0.58),
                         material=paint_mat)
        all_objs.append(panel)

    # ── DELIVERY BOX ──
    box = add_cube(f"{brand_key}_box", (0, -1.02, 1.42), (0.74, 0.76, 0.60),
                   material=box_mat, bevel=0.03)
    box_lid = add_cube(f"{brand_key}_box_lid", (0, -1.02, 1.75), (0.76, 0.78, 0.06),
                       material=box_mat, bevel=0.02)
    # Logo panel
    logo = add_cube(f"{brand_key}_logo", (0.376, -1.02, 1.42), (0.008, 0.38, 0.18),
                    material=decal_mat)
    # Reflective strips
    for side_y in [-0.39, 0.39]:
        strip = add_cube(f"{brand_key}_strip_{side_y}", (side_y, -1.02, 1.42),
                         (0.012, 0.72, 0.58),
                         material=new_material(f"{brand_key}_refl",
                                               (0.9,0.9,0.9), roughness=0.8, metallic=0,
                                               emissive=(0.6,0.6,0.6), emissive_strength=0.5))
        all_objs.append(strip)
    all_objs.extend([box, box_lid, logo])

    # ── BELLY FAIRING ──
    belly = add_cube(f"{brand_key}_belly", (0, 0.22, 0.52), (0.55, 1.6, 0.15),
                     material=paint_mat)
    all_objs.append(belly)

    return all_objs

# ─── RIDER BUILDER ──────────────────────────────────────────────────────────

def build_rider(brand_key, primary_color):
    print(f"  Building rider: {brand_key}")
    all_objs = []

    uniform_mat = new_material(f"{brand_key}_uniform", primary_color, roughness=0.82, metallic=0.04)
    helmet_mat  = new_material(f"{brand_key}_helmet",  primary_color, roughness=0.18, metallic=0.72)
    skin_mat    = new_material(f"{brand_key}_skin",    (0.78, 0.55, 0.38), roughness=0.82, metallic=0.0)
    dark_mat    = new_material(f"{brand_key}_rider_dark", (0.07,0.07,0.07), roughness=0.75, metallic=0.1)
    glove_mat   = new_material(f"{brand_key}_glove",   (0.1,0.1,0.1), roughness=0.7, metallic=0.05)
    visor_mat   = new_material(f"{brand_key}_visor",   (0.1,0.15,0.25), roughness=0.02, metallic=0.0)
    decal_mat   = new_material(f"{brand_key}_rdecal",  (1,1,1), roughness=0.9, metallic=0,
                               emissive=primary_color, emissive_strength=1.5)
    boot_mat    = new_material(f"{brand_key}_boot",    (0.06,0.06,0.06), roughness=0.72, metallic=0.12)

    # ── LOWER LEGS ──
    for sx in [-0.17, 0.17]:
        lower_leg = add_cube(f"{brand_key}_lleg_{sx}", (sx, 0.22, 0.72), (0.13, 0.15, 0.42),
                             material=uniform_mat)
        boot = add_cube(f"{brand_key}_boot_{sx}", (sx, 0.08, 0.48), (0.15, 0.24, 0.18),
                        material=boot_mat, bevel=0.02)
        all_objs.extend([lower_leg, boot])

    # ── THIGHS ──
    for sx in [-0.15, 0.15]:
        thigh = add_cube(f"{brand_key}_thigh_{sx}", (sx, 0.14, 1.14), (0.14, 0.16, 0.44),
                         material=uniform_mat)
        thigh.rotation_euler[0] = 0.4
        all_objs.append(thigh)

    # ── TORSO ──
    torso = add_cube(f"{brand_key}_torso", (0, -0.08, 1.72), (0.44, 0.34, 0.56),
                     material=uniform_mat, bevel=0.03)
    torso.rotation_euler[0] = -0.18

    # Chest decal / logo
    chest_decal = add_cube(f"{brand_key}_chest_decal", (0, 0.1, 1.84), (0.22, 0.005, 0.14),
                            material=decal_mat)
    chest_decal.rotation_euler[0] = -0.18
    all_objs.extend([torso, chest_decal])

    # ── UPPER ARMS ──
    for sx in [-0.3, 0.3]:
        uarm = add_cylinder(f"{brand_key}_uarm_{sx}", (sx, 0.16, 1.78),
                            radius=0.07, depth=0.42,
                            rotation=(0.3, 0, 0.4 if sx < 0 else -0.4),
                            material=uniform_mat)
        all_objs.append(uarm)

    # ── FOREARMS ──
    for sx in [-0.3, 0.3]:
        farm = add_cylinder(f"{brand_key}_farm_{sx}", (sx, 0.65, 1.58),
                            radius=0.058, depth=0.38,
                            rotation=(-0.9, 0, 0.15 if sx < 0 else -0.15),
                            material=uniform_mat)
        # Gloves
        glove = add_sphere(f"{brand_key}_glove_{sx}", (sx, 0.78, 1.44),
                           radius=0.075, material=glove_mat)
        all_objs.extend([farm, glove])

    # ── NECK ──
    neck = add_cylinder(f"{brand_key}_neck", (0, -0.02, 2.0),
                        radius=0.072, depth=0.18, material=skin_mat)
    all_objs.append(neck)

    # ── HELMET SHELL ──
    helmet = add_sphere(f"{brand_key}_helmet_shell", (0, -0.04, 2.18),
                        radius=0.235, material=helmet_mat)
    # Scale to elongated
    helmet.scale[1] = 1.05
    helmet.scale[2] = 1.12

    # Chin guard
    chin = add_cube(f"{brand_key}_chin", (0, 0.18, 2.1), (0.26, 0.13, 0.10),
                    material=helmet_mat, bevel=0.02)

    # Visor
    visor = add_cube(f"{brand_key}_visor", (0, 0.19, 2.12), (0.34, 0.08, 0.14),
                     material=visor_mat)
    visor.rotation_euler[0] = -0.1

    # Helmet vent slots
    for vx in [-0.08, 0.08]:
        vent = add_cube(f"{brand_key}_vent_{vx}", (vx, 0.2, 2.26),
                        (0.06, 0.025, 0.02), material=dark_mat)
        all_objs.append(vent)

    # Back reflective strip
    refl = add_cube(f"{brand_key}_hrefl", (0, -0.23, 2.18),
                    (0.18, 0.008, 0.04),
                    material=new_material(f"{brand_key}_hrefl_mat",
                                          (0.9,0.9,0.9), roughness=0.8, metallic=0,
                                          emissive=(0.5,0.5,0.5), emissive_strength=0.6))
    all_objs.extend([helmet, chin, visor, refl])

    return all_objs

# ─── PARKING SCENE ───────────────────────────────────────────────────────────

def build_parking_scene():
    print("\n Building parking scene")
    all_objs = []

    # Ground
    bpy.ops.mesh.primitive_plane_add(size=30, location=(0,0,0))
    ground = bpy.context.active_object
    ground.name = "parking_ground"
    gmat = new_material("asphalt", (0.06,0.06,0.06), roughness=0.88, metallic=0.05)
    ground.data.materials.append(gmat)
    all_objs.append(ground)

    # Parking line markings
    for i in range(5):
        x = (i - 2) * 3.2
        line = add_cube(f"park_line_{i}", (x, -2, 0.002), (0.06, 4.5, 0.004),
                        material=new_material(f"line_mat_{i}", (0.25,0.25,0.25), roughness=0.85, metallic=0))
        all_objs.append(line)

    # Horizontal lines
    for j in range(2):
        z = -2 + j * 4
        hline = add_cube(f"hline_{j}", (0, z, 0.002), (14.0, 0.06, 0.004),
                         material=new_material(f"hline_mat_{j}", (0.22,0.22,0.22), roughness=0.85, metallic=0))
        all_objs.append(hline)

    # Street lamps × 4
    for lx, ly in [(-6,-3), (6,-3), (-6,2), (6,2)]:
        pole = add_cylinder(f"lamp_pole_{lx}_{ly}", (lx, ly, 3.2),
                            radius=0.045, depth=6.4, material=new_material(f"pole_{lx}", (0.15,0.15,0.15), roughness=0.65, metallic=0.8))
        globe = add_sphere(f"lamp_globe_{lx}_{ly}", (lx + (0.8 if lx < 0 else -0.8), ly, 6.2),
                           radius=0.09,
                           material=new_material(f"globe_{lx}", (1.0,0.93,0.7), roughness=0.1,
                                                 emissive=(1.0,0.88,0.5), emissive_strength=6.0))
        all_objs.extend([pole, globe])

    # Puddles (reflective planes)
    for px, py in [(2.5, 0.5), (-3.0, 1.0), (0.5, -3.5)]:
        bpy.ops.mesh.primitive_plane_add(size=0.8, location=(px, py, 0.003))
        puddle = bpy.context.active_object
        puddle.name = f"puddle_{px}"
        pmat = new_material(f"puddle_mat_{px}", (0.04,0.04,0.06), roughness=0.02, metallic=0.95)
        puddle.data.materials.append(pmat)
        all_objs.append(puddle)

    return all_objs

# ─── ENVIRONMENT ─────────────────────────────────────────────────────────────

def build_environment():
    print("\n Building night environment")
    all_objs = []

    # Ground
    bpy.ops.mesh.primitive_plane_add(size=80, location=(0,0,0))
    g = bpy.context.active_object
    g.name = "env_ground"
    g.data.materials.append(new_material("env_asphalt", (0.06,0.06,0.06), roughness=0.88, metallic=0.05))
    all_objs.append(g)

    # Reflection plane
    bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, 0.003))
    rp = bpy.context.active_object
    rp.name = "env_reflection"
    rp.data.materials.append(new_material("env_refl", (0.04,0.04,0.04), roughness=0.02, metallic=0.95))
    all_objs.append(rp)

    # Building silhouettes
    import random
    random.seed(42)
    for i in range(16):
        angle = (i / 16) * math.pi * 2
        r = 24 + random.random() * 12
        w = 2 + random.random() * 3
        h = 8 + random.random() * 22
        d = 2 + random.random() * 3
        bx = math.cos(angle) * r
        bz = math.sin(angle) * r - 6
        bldg = add_cube(f"building_{i}", (bx, bz, h/2), (w, d, h),
                        material=new_material(f"bldg_{i}", (0.08,0.08,0.09), roughness=0.95, metallic=0.1))
        all_objs.append(bldg)

        # Window lights
        for wi in range(4):
            if random.random() > 0.45:
                wx = bx + (random.random()-0.5)*w*0.6
                wz = h * 0.2 + random.random() * h * 0.6
                win = add_cube(f"window_{i}_{wi}", (wx, bz + d/2 + 0.05, wz),
                               (0.25, 0.01, 0.3),
                               material=new_material(f"win_{i}_{wi}",
                                                     (1.0,0.8,0.5), roughness=1,
                                                     emissive=(1.0,0.75,0.35),
                                                     emissive_strength=random.random()*2.5+0.5))
                all_objs.append(win)

    return all_objs

# ─── MAIN EXPORT PIPELINE ─────────────────────────────────────────────────────

BRAND_CONFIGS = {
    'talabat': {
        'primary': (1.0, 0.32, 0.0),      # #FF5200
        'box_logo': (1.0, 1.0, 1.0),
    },
    'noon': {
        'primary': (0.96, 0.77, 0.09),    # #F5C518
        'box_logo': (0.0, 0.0, 0.0),
    },
    'careem': {
        'primary': (0.11, 0.75, 0.45),    # #1DBF73
        'box_logo': (1.0, 1.0, 1.0),
    },
    'keeta': {
        'primary': (0.94, 0.65, 0.0),     # #F0A500
        'box_logo': (1.0, 1.0, 1.0),
    },
}

def run():
    print("\n" + "="*60)
    print("  DUBAI RIDERS — Asset Export Pipeline")
    print("="*60)

    for brand_key, cfg in BRAND_CONFIGS.items():
        # ── BIKE ──
        print(f"\n[{brand_key.upper()}] Exporting bike...")
        clear_scene()
        bike_objs = build_bike(brand_key, cfg['primary'], cfg['box_logo'])
        select_all_objects(bike_objs)
        fp = os.path.join(OUTPUT_DIR, f"{brand_key}_bike.glb")
        export_glb(fp, selected_only=True)

        # ── RIDER ──
        print(f"[{brand_key.upper()}] Exporting rider...")
        clear_scene()
        rider_objs = build_rider(brand_key, cfg['primary'])
        select_all_objects(rider_objs)
        fp = os.path.join(OUTPUT_DIR, f"{brand_key}_rider.glb")
        export_glb(fp, selected_only=True)

    # ── PARKING SCENE ──
    print("\n[SCENE] Exporting parking lot...")
    clear_scene()
    park_objs = build_parking_scene()
    select_all_objects(park_objs)
    fp = os.path.join(OUTPUT_DIR, "parking_scene.glb")
    export_glb(fp, selected_only=True)

    # ── ENVIRONMENT ──
    print("\n[SCENE] Exporting night environment...")
    clear_scene()
    env_objs = build_environment()
    select_all_objects(env_objs)
    fp = os.path.join(OUTPUT_DIR, "dubai_night_environment.glb")
    export_glb(fp, selected_only=True)

    print("\n" + "="*60)
    print(f"  ✅ All assets exported to: {OUTPUT_DIR}")
    print("="*60 + "\n")

if __name__ == "__main__":
    run()
