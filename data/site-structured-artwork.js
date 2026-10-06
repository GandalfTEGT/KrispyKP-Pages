(function () {
  window.krispyStructuredArtwork = function (element, track) {
    const art = window.KRISPY_STRUCTURED_ARTWORK?.[track.id];
    if (!art) return false;
    element.setAttribute("role", "img");
    element.setAttribute("aria-label", art.alt);
    element.style.backgroundImage = "none";
    const frame = document.createElement("span");
    frame.className = "managed-media-frame";
    frame.dataset.kkpMediaFrame = art.usageId;
    const crop = document.createElement("span");
    crop.className = "managed-media-crop";
    const image = document.createElement("img");
    image.src = art.src;
    image.alt = art.alt;
    image.width = art.width;
    image.height = art.height;
    image.decoding = "async";
    image.dataset.kkpMediaId = art.usageId;
    crop.append(image);
    frame.append(crop);
    element.replaceChildren(frame);
    return true;
  };
})();
