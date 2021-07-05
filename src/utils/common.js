// Copies a string to the clipboard. Must be called from within an 
// event handler such as click. May return false if it failed, but
// this is not always possible. Browser support for Chrome 43+, 
// Firefox 42+, Safari 10+, Edge and IE 10+.
// IE: The clipboard feature may be disabled by an administrator. By
// default a prompt is shown the first time the clipboard is 
// used (per session).
// function copyToClipboard(text) {
//   if (window.clipboardData && window.clipboardData.setData) {
//     // IE specific code path to prevent textarea being shown while dialog is visible.
//     // eslint-disable-next-line no-undef
//     let clipboardData;
//     return clipboardData.setData("Text", text);
//
//   } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
//     const textarea = document.createElement("textarea");
//     textarea.textContent = text;
//     textarea.style.position = "fixed"; // Prevent scrolling to bottom of page in MS Edge.
//     document.body.appendChild(textarea);
//     textarea.select();
//     try {
//       return document.execCommand("copy"); // Security exception may be thrown by some browsers.
//     } catch (ex) {
//       console.warn("Copy to clipboard failed.", ex);
//       return false;
//     } finally {
//       document.body.removeChild(textarea);
//     }
//   }
// }

/* Image Pool */
export function ImagePool(size) {
    const ImageSize = size
    const images = []
    const counter = 0
    console.log(ImageSize, images, counter)

}

ImagePool.next = function () {
    if (this.images.length < this.ImageSize) {
        const image = new Image()
        this.images.push(image)
        return image
    } else {
        if (this.counter >= this.ImageSize) {
            this.counter = 0
        }
    }

    return this.images[this.counter++ % this.ImageSize]
}

export function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, {
        type: contentType
    });
}

export function nodesMap(source) {
    let nodesMap = {}

    function sourceMap(source, parent) {
        for (const key in source) {
            const node = source[key]
            const nodeId = node._id
            if (parent !== null) {
                nodesMap[nodeId] = node
                nodesMap[nodeId]["parent"] = parent
                nodesMap[nodeId]["parentId"] = parent._id
            } else {
                nodesMap[nodeId] = node
                nodesMap[nodeId]["parentId"] = null
                nodesMap[nodeId]["parent"] = null
            }
            sourceMap(node.children, node)
        }
    }

    if (source) {
        sourceMap([source], null)
    }

    return nodesMap
}