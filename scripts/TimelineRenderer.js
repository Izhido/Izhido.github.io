class TimelineRenderer {
	leftBorder;
	rightBorder;

	lineColor;
	frameColor;

	render(ctx, mdl, mdlRenderer, timeline) {
		let total = 0
		const elements = []
		let toHighlight = -1
		for (let f = 0; f < mdl.numFrames; f++) {
			const frame = mdl.frames[f]
			if (frame.numFrames > 1) {
				for (let i = 0; i < frame.numFrames; i++) {
					if (f == mdlRenderer.timelineFrame && i == mdlRenderer.timelineSubframe) {
						toHighlight = elements.length
					}
					if (i == 0) {
						total += frame.intervals[i]
					} else {
						total += (frame.intervals[i] - frame.intervals[i - 1])
					}
					const atStop = (i == frame.numFrames - 1)
					elements.push({
						time: total,
						atStop: atStop,
						subframe: true,
						last: (i == frame.numFrames - 1)
					})
				}
			} else {
				if (f == mdlRenderer.timelineFrame) {
					toHighlight = elements.length
				}
				total += 0.1
				let atStop
				if (timeline) {
					for (const entry of timeline) {
						if (entry.last == f) {
							atStop = true
							break;
						}
					}
				}
				elements.push({
					time: total,
					atStop: atStop
				})
			}
		}

		const width = ctx.canvas.width
		const height = ctx.canvas.height
		const timelineWidth = width - this.leftBorder - this.rightBorder

		ctx.reset()

		const stopTop = 4
		const frameTop = 8
		const subframeTop = 12
 
		if (toHighlight >= 0) {
			ctx.fillStyle = this.frameColor
			const element = elements[toHighlight]
			const top = (element.subframe ? subframeTop : frameTop)
			let x1
			if (toHighlight > 0) {
				const previous = elements[toHighlight - 1]
				x1 = this.leftBorder + timelineWidth * previous.time / total
			} else {
				x1 = this.leftBorder
			}
			const x2 = this.leftBorder + timelineWidth * element.time / total
			ctx.fillRect(x1, top, x2 - x1, height - top - top - 1)
		}

		ctx.strokeStyle = this.lineColor

		ctx.moveTo(this.leftBorder, height / 2)
		ctx.lineTo(width - this.rightBorder - 1, height / 2)

		ctx.moveTo(this.leftBorder, 0)
		ctx.lineTo(this.leftBorder, height - 1)
		ctx.moveTo(width - this.rightBorder - 1, 0)
		ctx.lineTo(width - this.rightBorder - 1, height - 1)

		for (let e = 0; e < elements.length - 1; e++) {
			const element = elements[e]
			if (element.subframe) {
				const x = this.leftBorder + timelineWidth * element.time / total
				const top = (element.atStop ? stopTop : subframeTop)
				ctx.moveTo(x, top)
				ctx.lineTo(x, height - top - 1)
			} else {
				const x = this.leftBorder + timelineWidth * element.time / total
				const top = (element.atStop ? stopTop : frameTop)
				ctx.moveTo(x, top)
				ctx.lineTo(x, height - top - 1)
			}
		}

		ctx.stroke()
	}
}