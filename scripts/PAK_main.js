window.addEventListener("load", () => {

    const pak = new PAK()

	let loadedName
	let pakName

    function onDownload(event) {
        const dataIndex = event.target.getAttribute("data-index")
        const index = Number.parseInt(dataIndex)
        if (index >= 0 && index < pak.files.length) {
            const path = pak.files[index].split("/")

            const filename = path[path.length - 1]

            const contents = pak.contents[index]

            const array = pak.arrayBuffer.slice(contents.filePos, contents.filePos + contents.fileLen)
            const blob = new Blob([array], { type: "application/octet-stream" })
            const fileURL = URL.createObjectURL(blob)

            const downloadLink = document.createElement("a")
            downloadLink.href = fileURL
            downloadLink.download = filename
            document.body.appendChild(downloadLink)
            downloadLink.click()

            URL.revokeObjectURL(fileURL)
        }
    }

    function buildFileNumberIndex() {
        const index = new Array(pak.files.length)
        for (let i = 0; i < pak.files.length; i++) {
            index[i] = i
        }
        return index
    }

    function buildFileNameIndex() {
        const sorted = new Array(pak.files.length)
        for (let i = 0; i < pak.files.length; i++) {
            sorted[i] = pak.files[i] + " -[" + i.toString()
        }
        sorted.sort()
        const index = new Array(pak.files.length)
        for (let i = 0; i < sorted.length; i++) {
            const entry = sorted[i]
            const p = entry.indexOf(" -[")
            index[i] = Number.parseInt(entry.substring(p + 3))
        }
        return index
    }

    function buildFileList(index) {
        const existingFileList = document.getElementById("fileList")
        existingFileList?.remove()

        const fileList = document.createElement("div")
        fileList.setAttribute("id", "fileList")

        const fileListTable = document.createElement("table")

        for (let i = 0; i < index.length; i++) {
            const f = index[i]
            const row = document.createElement("tr")

            const downloadCell = document.createElement("td")
            const download = document.createElement("button")
            download.setAttribute("data-index", f)
            download.addEventListener("click", onDownload)
            download.innerText = "\u2193"
            downloadCell.appendChild(download)
            row.appendChild(downloadCell)

            const numberCell = document.createElement("td")
            numberCell.innerText = "[" + f + "]"
            row.appendChild(numberCell)

            const nameCell = document.createElement("td")
            nameCell.innerText = pak.files[f]
            row.appendChild(nameCell)

            const sizeCell = document.createElement("td")
            sizeCell.innerText = pak.contents[f].fileLen
            row.appendChild(sizeCell)

            fileListTable.appendChild(row)
        }
        
        fileList.appendChild(fileListTable)

        const container = document.getElementById("container")
        container.appendChild(fileList)
    }

    function onSortCriteria(event) {
        let index
        if (event.target.value == "0") {
            index = buildFileNumberIndex()
        } else {
            index = buildFileNameIndex()
        }
        buildFileList(index)
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

        const loaded = pak.load(event.target.result)
        if (!loaded) {
            showErrorPopup("PAK load failed: " + pak.errorMessage)
            return
        } else {
            onDismissPopup()
        }

		pakName = loadedName
		loadedName = null

        const dropMessage = document.getElementById("dropMessage")
        dropMessage.style.visibility = "collapse"

        const existingPakHeader = document.getElementById("pakHeader")
        existingPakHeader?.remove()

        const pakHeader = document.createElement("div")
        pakHeader.setAttribute("id", "pakHeader")

        const pakNameSpan = document.createElement("span")
        pakNameSpan.setAttribute("id", "pakName")
        pakNameSpan.innerText = pakName
        pakHeader.appendChild(pakNameSpan)
        
        const pakStats = document.createElement("span")
        pakStats.setAttribute("id", "pakStats")
        pakStats.innerText = pak.files.length.toString() + " files, " + pak.arrayBuffer.byteLength.toString() + " bytes."
        pakHeader.appendChild(pakStats)

        const sortCriteria = document.createElement("select")
        sortCriteria.addEventListener("change", onSortCriteria)

        const byFileNumber = document.createElement("option")
        byFileNumber.setAttribute("value", "0")
        byFileNumber.innerText = "Sort by File #"
        sortCriteria.appendChild(byFileNumber)

        const byFileName = document.createElement("option")
        byFileName.setAttribute("value", "1")
        byFileName.innerText = "Sort by Name"
        sortCriteria.appendChild(byFileName)

        pakHeader.appendChild(sortCriteria)

        const index = buildFileNumberIndex()
        buildFileList(index)

        const container = document.getElementById("container")
        container.appendChild(pakHeader)
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

    const container = document.getElementById("container")
    container.addEventListener("dragover", onDragOver)
    container.addEventListener("drop", onDrop)
})
