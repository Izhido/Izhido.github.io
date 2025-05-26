class MDL {
    loaded;

    scaleX;
    scaleY;
    scaleZ;

    scaleOriginX;
    scaleOriginY;
    scaleOriginZ;

    boundingRadius;

    eyePositionX;
    eyePositionY;
    eyePositionZ;

    numSkins;
    skinWidth;
    skinHeight;

    numVerts;
    numTris;
    numFrames;

    syncType;

    flags;

    size;

    skins;

    stverts;

    triangles;

    frames;

    errorMessage;

    clear() {
        this.loaded = null

        this.scaleX = null
        this.scaleY = null
        this.scaleZ = null

        this.scaleOriginX = null
        this.scaleOriginY = null
        this.scaleOriginZ = null

        this.boundingRadius = null

        this.eyePositionX = null
        this.eyePositionY = null
        this.eyePositionZ = null

        this.numSkins = null
        this.skinWidth = null
        this.skinHeight = null

        this.numVerts = null
        this.numTris = null
        this.numFrames = null

        this.syncType = null

        this.flags = null

        this.size = null

        this.skins = null

        this.stverts = null

        this.triangles = null

        this.frames = null

        this.errorMessage = null
    }

    loadSkin(dataView, offset, skins, width, height) {
        const size = width * height
        skins.push(new Uint8Array(size))
        const skin = skins[skins.length - 1]
        for (let p = 0; p < size; p++) {
            skin[p] = dataView.getUint8(offset)
            offset++
        }

        return offset;
    }

    loadVertex(dataView, offset, vertex) {
        const x = dataView.getUint8(offset)
        offset++
        const y = dataView.getUint8(offset)
        offset++
        const z = dataView.getUint8(offset)
        offset++

        const normalIndex = dataView.getUint8(offset)
        offset++

        vertex.v = [x, y, z]
        vertex.normalIndex = normalIndex

        return offset;
    }

    loadFrame(dataView, offset, frames, numVerts) {
        const frame = {}

        frame.bBoxMin = {}
        offset = this.loadVertex(dataView, offset, frame.bBoxMin)

        frame.bBoxMax = {}
        offset = this.loadVertex(dataView, offset, frame.bBoxMax)

        frame.name = ""
        let zeroFound = false
        for (let p = 0; p < 16; p++) {
            const c = dataView.getUint8(offset)
            offset++

            if (!zeroFound) {
                if (c == 0) {
                    zeroFound = true
                } else {
                    frame.name += String.fromCharCode(c)
                }
            }
        }

        frame.verts = []
        for (let v = 0; v < numVerts; v++) {
            frame.verts.push({})
            offset = this.loadVertex(dataView, offset, frame.verts[frame.verts.length - 1])
        }

        frames.push(frame)

        return offset;
    }

    load(arrayBuffer) {
        if (arrayBuffer.length == 0) {
            this.errorMessage = "Empty MDL"
            return false;
        }

        const dataView = new DataView(arrayBuffer)
        let offset = 0

        const ident = dataView.getInt32(offset, true)
        offset += 4
        if (ident != 1330660425) {
            this.errorMessage = "ident is not IDP0"
            return false;
        }

        const version = dataView.getInt32(offset, true)
        offset += 4
        if (version != 6) {
            this.errorMessage = "version is not 6"
            return false;
        }

        const scaleX = dataView.getFloat32(offset, true)
        offset += 4
        const scaleY = dataView.getFloat32(offset, true)
        offset += 4
        const scaleZ = dataView.getFloat32(offset, true)
        offset += 4

        const scaleOriginX = dataView.getFloat32(offset, true)
        offset += 4
        const scaleOriginY = dataView.getFloat32(offset, true)
        offset += 4
        const scaleOriginZ = dataView.getFloat32(offset, true)
        offset += 4

        const boundingRadius = dataView.getFloat32(offset, true)
        offset += 4

        const eyePositionX = dataView.getFloat32(offset, true)
        offset += 4
        const eyePositionY = dataView.getFloat32(offset, true)
        offset += 4
        const eyePositionZ = dataView.getFloat32(offset, true)
        offset += 4

        const numSkins = dataView.getInt32(offset, true)
        offset += 4
        const skinWidth = dataView.getInt32(offset, true)
        offset += 4
        const skinHeight = dataView.getInt32(offset, true)
        offset += 4

        const numVerts = dataView.getInt32(offset, true)
        offset += 4
        const numTris = dataView.getInt32(offset, true)
        offset += 4
        const numFrames = dataView.getInt32(offset, true)
        offset += 4

        const syncType = dataView.getInt32(offset, true)
        offset += 4

        const flags = dataView.getInt32(offset, true)
        offset += 4

        const size = dataView.getFloat32(offset, true)
        offset += 4

        const skins = []

        for (let s = 0; s < numSkins; s++) {
            const skinType = dataView.getInt32(offset, true)
            offset += 4;

            const skin = { skinType: skinType, intervals: [], skins: [] }

            if (skinType == 0) /* ALIAS_SKIN_SINGLE */ {
                skin.numSkins = 1

                offset = this.loadSkin(dataView, offset, skin.skins, skinWidth, skinHeight)
            } else /* ALIAS_SKIN_GROUP */ {
                skin.numSkins = dataView.getInt32(offset, true)
                offset += 4

                let previousInterval = 0
                let incrementing = true
                for (let i = 0; i < skin.numSkins; i++) {
                    const interval = dataView.getFloat32(offset, true)
                    offset += 4

                    skin.intervals.push(interval)

                    if (incrementing) {
                        if (previousInterval >= interval) {
                            incrementing = false
                        }
                        previousInterval = interval
                    }
                }

                if (!incrementing) {
                    let interval = 0.1
                    for (let i = 0; i < skin.numSkins; i++) {
                        skin.intervals[i] = interval
                        interval += 0.1
                    }
                }

                for (let t = 0; t < skin.numSkins; t++) {
                    offset = this.loadSkin(dataView, offset, skin.skins, skinWidth, skinHeight)
                }
            }

            skins.push(skin)
        }

        const stverts = []

        for (let s = 0; s < numVerts; s++) {
            const onSeam = dataView.getInt32(offset, true)
            offset += 4

            const s = dataView.getInt32(offset, true)
            offset += 4

            const t = dataView.getInt32(offset, true)
            offset += 4

            stverts.push({ onSeam: onSeam, s: s, t: t })
        }

        const triangles = []

        for (let t = 0; t < numTris; t++) {
            const facesFront = dataView.getInt32(offset, true)
            offset += 4

            const v0 = dataView.getInt32(offset, true)
            offset += 4

            const v1 = dataView.getInt32(offset, true)
            offset += 4

            const v2 = dataView.getInt32(offset, true)
            offset += 4

            triangles.push({ facesFront: facesFront, vertIndex: [v0, v1, v2] })
        }

        const frames = []

        for (let f = 0; f < numFrames; f++) {
            const frameType = dataView.getInt32(offset, true)
            offset += 4

            const frame = { frameType: frameType, intervals: [], frames: [] }

            if (frameType == 0) /* ALIAS_SINGLE */ {
                frame.numFrames = 1

                offset = this.loadFrame(dataView, offset, frame.frames, numVerts)
            } else /* ALIAS_GROUP */ {
                frame.numFrames = dataView.getInt32(offset, true)
                offset += 4

                frame.bBoxMin = {}
                offset = this.loadVertex(dataView, offset, frame.bBoxMin)

                frame.bBoxMax = {}
                offset = this.loadVertex(dataView, offset, frame.bBoxMax)

                let previousInterval = 0
                let incrementing = true
                for (let i = 0; i < frame.numFrames; i++) {
                    const interval = dataView.getFloat32(offset, true)
                    offset += 4

                    frame.intervals.push(interval)

                    if (incrementing) {
                        if (previousInterval >= interval) {
                            incrementing = false
                        }
                        previousInterval = interval
                    }
                }

                if (!incrementing) {
                    let firstInterval = frame.intervals[0]
                    if (firstInterval < 1e-5) {
                        firstInterval = 0.1
                    }
                    let interval = firstInterval
                    for (let i = 0; i < frame.numSkins; i++) {
                        frame.intervals[i] = interval
                        interval += firstInterval
                    }
                }

                for (let e = 0; e < frame.numFrames; e++) {
                    offset = this.loadFrame(dataView, offset, frame.frames, numVerts)
                }
            }

            frames.push(frame)
        }

        this.clear()

        this.loaded = true

        this.scaleX = scaleX
        this.scaleY = scaleY
        this.scaleZ = scaleZ

        this.scaleOriginX = scaleOriginX
        this.scaleOriginY = scaleOriginY
        this.scaleOriginZ = scaleOriginZ

        this.boundingRadius = boundingRadius

        this.eyePositionX = eyePositionX
        this.eyePositionY = eyePositionY
        this.eyePositionZ = eyePositionZ

        this.numSkins = numSkins
        this.skinWidth = skinWidth
        this.skinHeight = skinHeight

        this.numVerts = numVerts
        this.numTris = numTris
        this.numFrames = numFrames

        this.syncType = syncType

        this.flags = flags

        this.size = size

        this.skins = skins

        this.stverts = stverts

        this.triangles = triangles

        this.frames = frames

        return true;
    }
}
