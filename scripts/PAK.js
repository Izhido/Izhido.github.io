class PAK {
    loaded;

    files;

    contents;

    arrayBuffer;

    clear() {
        this.loaded = null

        this.files = null

        this.contents = null

        this.arrayBuffer = null
    }

    load(arrayBuffer) {
        if (arrayBuffer.length == 0) {
            this.errorMessage = "Empty PAK"
            return false;
        }

        const dataView = new DataView(arrayBuffer)
        let offset = 0

        const ident = dataView.getInt32(offset, true)
        offset += 4
        if (ident != 1262698832) {
            this.errorMessage = "ident is not PACK"
            return false;
        }

        const dirOfs = dataView.getInt32(offset, true)
        offset += 4
        if (dirOfs < 0 || dirOfs >= arrayBuffer.length - 1) {
            this.errorMessage = "dirofs is out of range"
            return false;
        }

        const dirLen = dataView.getInt32(offset, true)
        offset += 4
        if (dirLen < 1) {
            this.errorMessage = "dirlen is invalid"
            return false;
        }

        if (dirOfs + dirLen > arrayBuffer.length) {
            this.errorMessage = "dirofs + dirlen is out of range"
            return false;
        }

        if (dirLen % 64 != 0) {
            this.errorMessage = "dirLen is not a multiple of 64"
            return false;
        }

        const numPackFiles = dirLen / 64

        const files = new Array()
        const contents = new Array()

        offset = dirOfs

        for (let f = 0; f < numPackFiles; f++) {
            let name = ""
            let zeroFound = false
            for (let p = 0; p < 56; p++) {
                const c = dataView.getUint8(offset)
                offset++

                if (!zeroFound) {
                    if (c == 0) {
                        zeroFound = true
                    } else {
                        name += String.fromCharCode(c)
                    }
                }
            }
            const filePos = dataView.getInt32(offset, true)
            offset += 4

            if (filePos < 0 || filePos >= arrayBuffer.length) {
                this.errorMessage = "filePos for " + name + " is out of range"
                return false;
            }

            const fileLen = dataView.getInt32(offset, true)
            offset += 4

            if (fileLen < 1) {
                this.errorMessage = "fileLen for " + name + " is invalid"
                return false;
            }

            if (filePos + fileLen > arrayBuffer.length) {
                this.errorMessage = "filePos + fileLen for " + name + " is out of range"
                return false;
            }

            files[f] = name
            contents[f] = { filePos: filePos, fileLen: fileLen }
        }

        this.clear()

        this.loaded = true

        this.files = files

        this.contents = contents

        this.arrayBuffer = arrayBuffer

        return true;
    }
}
