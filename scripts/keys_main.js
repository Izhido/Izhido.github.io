window.addEventListener("load", () => {
	let pressed = []
    let pressedSet = new Set()

	function onKeyDown(event) {
		event.preventDefault()

        if (!pressedSet.has(event.code)) {
            pressed.push(event.code)
            pressedSet.add(event.code)
        }

        displayPressed()
	}

	function onKeyUp(event) {
		event.preventDefault()

        if (pressedSet.has(event.code)) {
            pressedSet.delete(event.code)
            for (let p = 0; p < pressed.length; p++) {
                if (pressed[p] == event.code) {
                    pressed.splice(p, 1)
                    break;
                }
            }
        }

        displayPressed()
	}

	function displayPressed() {
		const message = document.getElementById("message")

        if (pressed.length > 0) {
            let text = ""
            for (let p = 0; p < pressed.length; p++) {
                if (p > 0) {
                    text += " + "
                }
                text += "[ "
                text += pressed[p]
                text += " ]"
            }
            message.innerText = text
 			return;
		}

        message.innerText = "Press any combination of keys to see if they're recognized.";
	}

	document.body.addEventListener("keydown", onKeyDown);
	document.body.addEventListener("keyup", onKeyUp);

	displayPressed()
})
