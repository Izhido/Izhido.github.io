window.addEventListener("load", () => {
	const canvas = document.getElementById("canvas")

	const gl = canvas.getContext("webgl")
	if (!(gl instanceof WebGLRenderingContext)) {
		const dropMessage = document.getElementById("dropMessage")
		dropMessage.innerText = "WebGL is not supported in this browser."
		return;
	}

	const timelineCanvas = document.getElementById("timeline") 
	const ctx = timelineCanvas.getContext("2d")

	const mdl = new MDL()
	
	const mdlRenderer = new MDLRenderer()

	const timelineRenderer = new TimelineRenderer()
	timelineRenderer.leftBorder = 70;
	timelineRenderer.rightBorder = 80;

	let loadedName
	let mdlName

	let timeline
	let timelineIndex

	let elapsedTime

	function render() {
		mdlRenderer.render(gl, mdl)
		timelineRenderer.render(ctx, mdl, mdlRenderer, timeline)
	}

	function resizeCanvas() {
		canvas.width = window.innerWidth
		canvas.height = window.innerHeight
		timelineCanvas.width = window.innerWidth - 20
		timelineCanvas.height = 40
		if (!playing) {
			render()
		}
	}

	let mousePreviousClientX
	let mousePreviousClientY

	function onMouseDown(event) {
		event.preventDefault()
		if (event.buttons & 1) {
			mousePreviousClientX = event.clientX
			mousePreviousClientY = event.clientY
		}
	}

	function onMouseUp(event) {
		event.preventDefault()
	}

	function onMouseMove(event) {
		event.preventDefault()
		if (event.buttons & 1) {
			mdlRenderer.rotationXZ += ((mousePreviousClientX - event.clientX) * 90 / 256)
			mdlRenderer.rotationYZ += ((mousePreviousClientY - event.clientY) * 90 / 256)
			if (!playing) {
				render()
			}
			mousePreviousClientX = event.clientX
			mousePreviousClientY = event.clientY
		}
	}

	function onWheel(event) {
		event.preventDefault()
		mdlRenderer.zoomFactor = Math.max(0.01, mdlRenderer.zoomFactor + event.deltaY * 0.01)
		if (!playing) {
			render()
		}
	}

	let playing = false

	function nextFrame() {
		if (playing) {
			elapsedTime += 0.1
			const frame = mdl.frames[mdlRenderer.timelineFrame]
			if (frame.numFrames > 1) {
				const intervals = frame.intervals
				const numIntervals = intervals.length
				const lastInterval = intervals[numIntervals - 1]
				if (lastInterval > 0) {
					const elapsedInInterval = elapsedTime % lastInterval
					let subframe = intervals.length - 1
					for (let i = intervals.length - 1; i >= 0; i--) {
						if ((intervals[i] - elapsedInInterval) < 1e-5) {
							break;
						} else {
							subframe--
						}
					}
					mdlRenderer.timelineSubframe = subframe
				}
			} else {
				mdlRenderer.timelineFrame++
				if (timeline) {
					if (mdlRenderer.timelineFrame > timeline[timelineIndex].last) {
						mdlRenderer.timelineFrame = timeline[timelineIndex].first
					}
				} else if (mdlRenderer.timelineFrame >= mdl.numFrames) {
					mdlRenderer.timelineFrame = 0
				}
				mdlRenderer.timelineSubframe = 0
			}
			const skin = mdl.skins[mdlRenderer.skinIndex]
			if (skin.numSkins > 1) {
				const intervals = skin.intervals
				const numIntervals = intervals.length
				const lastInterval = intervals[numIntervals - 1]
				if (lastInterval > 0) {
					const elapsedInInterval = elapsedTime % lastInterval
					let subindex = intervals.length - 1
					for (let i = intervals.length - 1; i >= 0; i--) {
						if ((intervals[i] - elapsedInInterval) < 1e-5) {
							break;
						} else {
							subindex--
						}
					}
					mdlRenderer.skinSubindex = subindex
				}
			}
			render()
			setTimeout(nextFrame, 100)
		}
	}

	function start(target) {
		playing = true
		target.innerHTML = "&#x23F9;"

		setTimeout(nextFrame, 100)
	}

	function stop(target) {
		playing = false
		target.innerHTML = "&#x23F5;"
	}

	function onPlay(event) {
		if (playing) {
			stop(event.target)
		} else {
			start(event.target)
		}
	}

	function updateSkipAvailability() {
		const skipPrevious = document.getElementById("skipPrevious")
		skipPrevious.disabled = (timeline == null || timelineIndex <= 0)
		const skipNext = document.getElementById("skipNext")
		skipNext.disabled = (timeline == null || timelineIndex >= (timeline.length - 1))
	}

	function onSkipPrevious() {
		if (timeline && timelineIndex > 0) {
			timelineIndex--
			mdlRenderer.timelineFrame = timeline[timelineIndex].first
			mdlRenderer.timelineSubframe = 0
			if (!playing) {
				render()
			}
			updateSkipAvailability()
		}
	}

	function onSkipNext() {
		if (timeline && timelineIndex < timeline.length - 1) {
			timelineIndex++
			mdlRenderer.timelineFrame = timeline[timelineIndex].first
			mdlRenderer.timelineSubframe = 0
			if (!playing) {
				render()
			}
			updateSkipAvailability()
		}
	}

	function onSkinSelect(event) {
		const index = Number.parseInt(event.target.value)
		mdlRenderer.skinIndex = index
		mdlRenderer.skinSubindex = Math.min(mdlRenderer.skinSubindex, mdl.skins[mdlRenderer.skinIndex].numSkins - 1)
		if (!playing) {
			render()
		}
	}

	function showErrorPopup(message) {
		const errorMessage = document.getElementById("errorMessage")
		errorMessage.innerText = message
		const errorPopup = document.getElementById("errorPopup")
		errorPopup.style.visibility = "visible"
	}

	function onDismissPopup() {
		const errorMessage = document.getElementById("errorMessage")
		errorMessage.innerText = null
		const errorPopup = document.getElementById("errorPopup")
		errorPopup.style.visibility = "collapse"
	}

	function readFile(event) {
		if (!event.target.result instanceof ArrayBuffer) {
			return;
		}

		const loaded = mdl.load(event.target.result)
		if (!loaded) {
			showErrorPopup("MDL load failed: " + mdl.errorMessage)
			return
		} else {
			onDismissPopup()
		}

		mdlName = loadedName
		loadedName = null

		const dropMessage = document.getElementById("dropMessage")
		dropMessage.style.visibility = "collapse"

		const existingMdlHeader = document.getElementById("mdlHeader")
		existingMdlHeader?.remove()

		const mdlHeader = document.createElement("div")
		mdlHeader.setAttribute("id", "mdlHeader")

		const mdlNameSpan = document.createElement("span")
		mdlNameSpan.setAttribute("id", "mdlName")
		mdlNameSpan.innerText = mdlName
		mdlHeader.appendChild(mdlNameSpan)
		
		const mdlStats = document.createElement("span")
		mdlStats.setAttribute("id", "mdlStats")
		mdlStats.innerText = mdl.numFrames + " frames, " + mdl.numSkins + " skins, " + event.target.result.byteLength.toString() + " bytes, CRC: " + mdl.crc.toString() + "."
		mdlHeader.appendChild(mdlStats)

		const container = document.getElementById("container")
		container.appendChild(mdlHeader)

		const timelineView = document.getElementById("timelineView")
		timelineView.style.visibility = "visible"

		const play = document.getElementById("play")
		stop(play)

		mdlRenderer.timelineFrame = 0
		mdlRenderer.timelineSubframe = 0
		mdlRenderer.skinIndex = 0
		mdlRenderer.skinSubindex = 0
		if (defaultTimelines.has(mdlName)) {
			const timelineToUse = defaultTimelines.get(mdlName)
			if (timelineToUse[timelineToUse.length - 1].last + 1 == mdl.numFrames) {
				timeline = timelineToUse
			}
		} else {
			timeline = null
		}
		timelineIndex = 0

		elapsedTime = 0

		updateSkipAvailability()

		const existingSkinSelect = document.getElementById("skinSelect")
		existingSkinSelect?.remove()

		const skinSelect = document.createElement("select")
		skinSelect.setAttribute("id", "skinSelect")
		skinSelect.addEventListener("change", onSkinSelect)
		for (let i = 0; i < mdl.numSkins; i++) {
			const skin = document.createElement("option")
			skin.setAttribute("value", i.toString())
			skin.innerText = "Skin " + i.toString()
			skinSelect.appendChild(skin)
		}
		timelineView.appendChild(skinSelect)

		render()
	}

	function loadFile(file) {
		loadedName = file.name
		var reader = new FileReader()
		reader.addEventListener("loadend", readFile)
		reader.readAsArrayBuffer(file)
	}

	function onDragOver(event) {
		event.preventDefault()
	}

	function onDrop(event) {
		event.preventDefault()
		if (event.dataTransfer.items) {
			if (event.dataTransfer.items.length > 0) {
				const item = event.dataTransfer.items[0]
				if (item.kind = "file") {
					const file = item.getAsFile()
					loadFile(file)
				}
			}
		} else if (event.dataTransfer.files) {
			if (event.dataTransfer.files.length > 0) {
				const file = event.dataTransfer.files[0]
				loadFile(file)
			}
		}
	}

	const dismissPopup = document.getElementById("dismissPopup")
	dismissPopup.addEventListener("click", onDismissPopup)

	canvas.addEventListener("mousedown", onMouseDown)
	canvas.addEventListener("mouseup", onMouseUp)
	canvas.addEventListener("mousemove", onMouseMove)
	canvas.addEventListener("wheel", onWheel)
	canvas.addEventListener("dragover", onDragOver)
	canvas.addEventListener("drop", onDrop)

	mdlRenderer.setup(gl)
	mdlRenderer.clearColor = { r: 1, g: 1, b: 1, a: 1 }
	timelineRenderer.lineColor = "black"
	timelineRenderer.frameColor = "gray"
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		mdlRenderer.clearColor.r = 0
		mdlRenderer.clearColor.g = 0
		mdlRenderer.clearColor.b = 0
		timelineRenderer.lineColor = "white"
	}

	window.addEventListener("resize", resizeCanvas)
	resizeCanvas()

	const play = document.getElementById("play")
	play.addEventListener("click", onPlay)

	const skipPrevious = document.getElementById("skipPrevious")
	skipPrevious.addEventListener("click", onSkipPrevious)

	const skipNext = document.getElementById("skipNext")
	skipNext.addEventListener("click", onSkipNext)
})
