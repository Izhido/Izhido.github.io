class Matrix {
	static multiply(a, b) {
		return [
			a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3],
			a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3],
			a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3],
			a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3],
			a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7],
			a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7],
			a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7],
			a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7],
			a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11],
			a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11],
			a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11],
			a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11],
			a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15],
			a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15],
			a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15],
			a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15]
		]
	}

	static rotationXY(angle) {
		const angleInRadians = angle * Math.PI / 180
		const sine = Math.sin(angleInRadians)
		const cosine = Math.cos(angleInRadians)
		return [
			cosine, -sine, 0, 0,
			sine, cosine, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]
	}

	static rotationXZ(angle) {
		const angleInRadians = angle * Math.PI / 180
		const sine = Math.sin(angleInRadians)
		const cosine = Math.cos(angleInRadians)
		return [
			cosine, 0, sine, 0,
			0, 1, 0, 0,
			-sine, 0, cosine, 0,
			0, 0, 0, 1
		]
	}

	static rotationYZ(angle) {
		const angleInRadians = angle * Math.PI / 180
		const sine = Math.sin(angleInRadians)
		const cosine = Math.cos(angleInRadians)
		return [
			1, 0, 0, 0,
			0, cosine, -sine, 0,
			0, sine, cosine, 0,
			0, 0, 0, 1
		]
	}

	static scale(x, y, z) {
		return [
			x, 0, 0, 0, 
			0, y, 0, 0, 
			0, 0, z, 0, 
			0, 0, 0, 1 
		]
	}

	static translation(x, y, z) {
		return [
			1, 0, 0, 0, 
			0, 1, 0, 0, 
			0, 0, 1, 0, 
			x, y, z, 1 
		]
	}

	static perspective(FOV, aspectRatio, near, far) {
		const fovInRadians = FOV * Math.PI / 180
		const yScale = 1 / Math.tan(fovInRadians / 2)
		const xScale = yScale / aspectRatio
		const delta = near - far
		return [
			xScale, 0, 0, 0,
			0, yScale, 0, 0,
			0, 0, (near + far) / delta, -1,
			0, 0, 2 * far * near / delta, 0
		]
	}
}
