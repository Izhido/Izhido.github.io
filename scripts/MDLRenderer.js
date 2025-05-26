class MDLRenderer {
	program;

	vertexBuffer;
	texCoordsBuffer;
	indexBuffer;

	vertexPosition;
	vertexTexCoords;

	modelView;
	projection;
	texSize;

	skinTexture;
	paletteTexture;

	skinSampler;
	paletteSampler;

    clearColor;

    rotationXZ;
	rotationYZ;

	zoomFactor;

	timelineFrame;
	timelineSubframe;

	skinIndex;
	skinSubindex;

	setup(gl) {
		this.rotationXZ = 0
		this.rotationYZ = 0
		this.zoomFactor = 64

		const vertexSource = `
            precision highp float;

            attribute vec3 vertexPosition;
            attribute vec2 vertexTexCoords;

            uniform mat4 modelView;
            uniform mat4 projection;
            uniform vec2 texSize;

            varying vec2 fragmentTexCoords;
            varying vec2 fragmentTexSize;

            void main(void) 
            {
                gl_Position = projection * modelView * vec4(vertexPosition, 1);
                fragmentTexCoords = vertexTexCoords;
                fragmentTexSize = texSize;
            }
        `
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(vertexShader, vertexSource)
        gl.compileShader(vertexShader)
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            const compileError = gl.getShaderInfoLog(vertexShader)
            const errorMessage = document.getElementById("errorMessage")
            errorMessage.innerText = "Vertex shader compilation failed: " + compileError
            return;
        }

        const fragmentSource = `
            precision highp float;

            uniform sampler2D skinSampler;
            uniform sampler2D paletteSampler;

            varying vec2 fragmentTexCoords;
            varying vec2 fragmentTexSize;

            void main(void)
            {
                vec2 fragmentTexCoordsToSample = fragmentTexCoords / fragmentTexSize;
                vec4 entry = texture2D(skinSampler, fragmentTexCoordsToSample);
                gl_FragColor = texture2D(paletteSampler, vec2(entry.x, 0));
            }
        `
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(fragmentShader, fragmentSource)
        gl.compileShader(fragmentShader)
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            const compileError = gl.getShaderInfoLog(fragmentShader)
            const errorMessage = document.getElementById("errorMessage")
            errorMessage.innerText = "Fragment shader compilation failed: " + compileError
            return;
        }

        this.program = gl.createProgram()
        gl.attachShader(this.program, vertexShader)
        gl.attachShader(this.program, fragmentShader)
        gl.linkProgram(this.program)
        gl.detachShader(this.program, vertexShader)
        gl.detachShader(this.program, fragmentShader)
        gl.deleteShader(vertexShader)
        gl.deleteShader(fragmentShader)
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            const linkError = gl.getProgramInfoLog(this.program)
            const errorMessage = document.getElementById("errorMessage")
            errorMessage.innerText = "Shader linking failed: " + linkError
            return;
        }

        this.vertexPosition = gl.getAttribLocation(this.program, "vertexPosition")
        this.vertexTexCoords = gl.getAttribLocation(this.program, "vertexTexCoords")

        this.modelView = gl.getUniformLocation(this.program, "modelView")
        this.projection = gl.getUniformLocation(this.program, "projection")
        this.texSize = gl.getUniformLocation(this.program, "texSize")

        this.skinSampler = gl.getUniformLocation(this.program, "skinSampler")
        this.paletteSampler = gl.getUniformLocation(this.program, "paletteSampler")

        gl.enable(gl.DEPTH_TEST);
    }

    render(gl, mdl) {
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
		gl.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, 1.0)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		if (mdl.loaded) {
			const vertexInput = mdl.frames[this.timelineFrame].frames[this.timelineSubframe].verts
			const vertices = new Array(mdl.numVerts * 2 * 3)
			let p = 0
			for (let v = 0; v < mdl.numVerts; v++) {
				const x = vertexInput[v].v[0]
				const y = vertexInput[v].v[1]
				const z = vertexInput[v].v[2]
				vertices[p] = x
				p++
				vertices[p] = z
				p++
				vertices[p] = y
				p++
				vertices[p] = x
				p++
				vertices[p] = z
				p++
				vertices[p] = y
				p++
			}
			const vertexArray = new Float32Array(vertices)

			const texCoordsInput = mdl.stverts
			const texCoords = new Array(mdl.numVerts * 2 * 2)
			const skinHalfWidth = mdl.skinWidth / 2
			p = 0
			for (let v = 0; v < mdl.numVerts; v++) {
				const s = texCoordsInput[v].s
				const t = texCoordsInput[v].t
				texCoords[p] = s
				p++
				texCoords[p] = t
				p++
				texCoords[p] = s + skinHalfWidth
				p++
				texCoords[p] = t
				p++
			}
			const texCoordsArray = new Float32Array(texCoords)

			const indexInput = mdl.triangles
			const indices = new Array(mdl.numTris * 3)
			p = 0
			for (let t = 0; t < mdl.numTris; t++) {
				const v0 = indexInput[t].vertIndex[0]
				const v1 = indexInput[t].vertIndex[1]
				const v2 = indexInput[t].vertIndex[2]
				const facesFront = mdl.triangles[t].facesFront
				const v0back = (((texCoordsInput[v0].onSeam & 0x20) == 0x20) /* ALIAS_ONSEAM */ && facesFront == 0)
				const v1back = (((texCoordsInput[v1].onSeam & 0x20) == 0x20) /* ALIAS_ONSEAM */ && facesFront == 0)
				const v2back = (((texCoordsInput[v2].onSeam & 0x20) == 0x20) /* ALIAS_ONSEAM */ && facesFront == 0)
				indices[p] = v0 * 2 + (v0back ? 1 : 0)
				p++
				indices[p] = v1 * 2 + (v1back ? 1 : 0)
				p++
				indices[p] = v2 * 2 + (v2back ? 1 : 0)
				p++
			}
			const indexArray = new Uint16Array(indices)

			gl.useProgram(this.program)

			if (this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer)
			this.vertexBuffer = gl.createBuffer()
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
			gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)

			gl.enableVertexAttribArray(this.vertexPosition)
			gl.vertexAttribPointer(this.vertexPosition, 3, gl.FLOAT, false, 0, 0)

			if (this.texCoordsBuffer) gl.deleteBuffer(this.texCoordsBuffer)
			this.texCoordsBuffer = gl.createBuffer()
			gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer)
			gl.bufferData(gl.ARRAY_BUFFER, texCoordsArray, gl.STATIC_DRAW)

			gl.enableVertexAttribArray(this.vertexTexCoords)
			gl.vertexAttribPointer(this.vertexTexCoords, 2, gl.FLOAT, false, 0, 0)

			if (this.indexBuffer) gl.deleteBuffer(this.indexBuffer)
			this.indexBuffer = gl.createBuffer()
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW)

			const translationMatrix = Matrix.translation(-128, -128, -128)
			const rotationXZMatrix = Matrix.rotationXZ(this.rotationXZ);
			const rotationYZMatrix = Matrix.rotationYZ(this.rotationYZ);
			const scaleMatrix = Matrix.scale(mdl.scaleX, mdl.scaleZ, mdl.scaleY)
			const zoomMatrix = Matrix.translation(0, 0, -this.zoomFactor)
			const m1 = Matrix.multiply(scaleMatrix, translationMatrix)
			const m2 = Matrix.multiply(rotationXZMatrix, m1)
			const m3 = Matrix.multiply(rotationYZMatrix, m2)
			const modelViewMatrix = Matrix.multiply(zoomMatrix, m3)
			gl.uniformMatrix4fv(this.modelView, false, new Float32Array(modelViewMatrix))

			gl.uniform2f(this.texSize, mdl.skinWidth, mdl.skinHeight)

			const projectionMatrix = Matrix.perspective(90, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 2048)
			gl.uniformMatrix4fv(this.projection, false, new Float32Array(projectionMatrix))

			const skin = mdl.skins[this.skinIndex].skins[this.skinSubindex]

			if (this.skinTexture) gl.deleteTexture(this.skinTexture)
			this.skinTexture = gl.createTexture()
			gl.activeTexture(gl.TEXTURE0)
			gl.bindTexture(gl.TEXTURE_2D, this.skinTexture)
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, mdl.skinWidth, mdl.skinHeight, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, skin)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

			gl.uniform1i(this.skinSampler, 0)

			const palette = new Uint8Array(defaultPalette)

			if (this.paletteTexture) gl.deleteTexture(this.paletteTexture)
			this.paletteTexture = gl.createTexture()
			gl.activeTexture(gl.TEXTURE1)
			gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture)
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 256, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, palette)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

			gl.uniform1i(this.paletteSampler, 1)

			gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
		}
	}
}
