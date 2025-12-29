(function () {
    const isEditable = el => el && (el.isContentEditable || !!el?.closest('[contenteditable="true"]'));

    function getEditable(el) {
        if (!el) return null;
        if (el.isContentEditable) return el;
        return el.closest ? el.closest('[contenteditable="true"]') : null;
    }

    function insertLineBreak(editable) {
        if (!editable) return;

        const sel = window.getSelection();
        if (!sel) return;

        // Ensure we have a range
        if (sel.rangeCount === 0) {
            const r = document.createRange();
            r.selectNodeContents(editable);
            r.collapse(false);
            sel.addRange(r);
        }

        const range = sel.getRangeAt(0);

        // Make sure caret is inside this editable
        if (!editable.contains(range.startContainer)) {
            range.selectNodeContents(editable);
            range.collapse(false);
        }

        // Insert <br> and a zero-width space so caret lands after it cleanly
        range.deleteContents();
        const br = document.createElement("br");
        range.insertNode(br);

        const zws = document.createTextNode("\u200B");
        br.parentNode.insertBefore(zws, br.nextSibling);

        range.setStartAfter(zws);
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);
    }

    function handler(e) {
        if (e.key !== "Enter") return;
        if (!isEditable(e.target)) return;

        // Stop their send logic
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();

        // Insert our newline
        const editable = getEditable(e.target);
        insertLineBreak(editable);
    }

    // For re-testing: clean up any previous install under this name
    if (typeof window._chatEnterHandler == "function") {
        document.removeEventListener("keydown", window._chatEnterHandler, true);
    }
    window._chatEnterHandler = handler;
    document.addEventListener("keydown", handler, true);
})();
