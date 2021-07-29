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

export function elemXPathLite(nodes, originNodeMaps, element, XPathLite = true) {
    let mapAttrCount = {}

    function incrAttrCount(collectionKey, key) {
        if (!Object.prototype.hasOwnProperty.call(mapAttrCount, collectionKey)) {
            mapAttrCount[collectionKey] = {}
        }
        let count = mapAttrCount[collectionKey][key] || 0;
        mapAttrCount[collectionKey][key] = count + 1;
    }

    function getAttrCount(collectionKey, key) {
        let mapCount = mapAttrCount[collectionKey];
        if (!mapCount) {
            return 0
        }
        return mapCount[key] || 0;
    }

    nodes.forEach((n) => {
        incrAttrCount("label", n.label)
        incrAttrCount("resourceId", n.resourceId)
        incrAttrCount("text", n.text)
        incrAttrCount("_type", n._type)
        incrAttrCount("description", n.description)
    })
    let node = element;
    let array = [];
    while (node && node.parentId) {
        const parent = originNodeMaps[node.parentId]
        if (getAttrCount("label", node.label) === 1 && XPathLite) {
            array.push(`*[@label="${node.label}"]`)
            break
        } else if (getAttrCount("resourceId", node.resourceId) === 1 && XPathLite) {
            array.push(`*[@resource-id="${node.resourceId}"]`)
            break
        } else if (getAttrCount("text", node.text) === 1 && XPathLite) {
            array.push(`*[@text="${node.text}"]`)
            break
        } else if (getAttrCount("description", node.description) === 1 && XPathLite) {
            array.push(`*[@content-desc="${node.description}"]`)
            break
        } else if (getAttrCount("_type", node._type) === 1 && XPathLite) {
            array.push(`${node._type}`)
            break
        } else if (!parent) {
            array.push(`${node._type}`)
        } else {
            let index = 0;
            parent.children.some((n) => {
                if (n._type === node._type) {
                    index++
                }
                return n._id === node._id
            })
            array.push(`${node._type}[${index}]`)
        }
        if (node.parent && node.parent._type) {
            node = parent;
        } else {
            break
        }
    }
    return `//${array.reverse().join("/")}`
}