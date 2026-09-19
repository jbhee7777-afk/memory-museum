/* 카메라 이미지의 중앙 영역과 미리보기 가이드는 동일한 계산을 사용합니다. */
window.MuseumCapture = (() => {
  function guide(w, h, landscape = false) {
    const ratio = landscape ? 1.414 : 1 / 1.414;
    let ch = h * .88, cw = ch * ratio;
    if (cw > w * .88) { cw = w * .88; ch = cw / ratio; }
    return { x: (w - cw) / 2, y: (h - ch) / 2, w: cw, h: ch };
  }
  function make(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
  function blob(c) { return new Promise((resolve, reject) => c.toBlob(b => b ? resolve(b) : reject(new Error('encode')), 'image/jpeg', .9)); }
  function crop(source, rect) {
    const scale = Math.min(1, 1600 / Math.max(rect.w, rect.h));
    const c = make(rect.w * scale, rect.h * scale);
    c.getContext('2d').drawImage(source, rect.x, rect.y, rect.w, rect.h, 0, 0, c.width, c.height); return c;
  }
  async function fromVideo(video, settings) {
    if (!video.videoWidth) throw new Error('not ready');
    const c = make(video.videoWidth, video.videoHeight); c.getContext('2d').drawImage(video, 0, 0);
    let output = null, mode = '중앙 가이드';
    // 자동 인식은 보조 기능입니다. 실패하면 반드시 가이드 잘라내기로 이어집니다.
    if (settings.autoDocument && window.MuseumAdvanced) {
      try { output = MuseumAdvanced.documentCrop(c); if (output) mode = '종이 자동 보정'; } catch { output = null; }
    }
    if (settings.review || !output) { const reviewed = await MuseumCrop.review(c); if (!reviewed) return null; output = reviewed; mode = '종이 크롭 · 원근 보정'; }
    if (settings.hideQR && window.MuseumAdvanced) { try { MuseumAdvanced.hideQR(output); } catch {} }
    return { blob: await blob(output), mode };
  }
  async function fromFile(file) {
    if (!file.type.startsWith('image/') || file.size > 30 * 1024 * 1024) throw new Error('invalid image');
    const url = URL.createObjectURL(file), img = new Image();
    try {
      img.src = url; await img.decode();
      if (img.naturalWidth * img.naturalHeight > 60000000) throw new Error('large image');
      const source = crop(img, { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight });
      const output = await MuseumCrop.review(source);
      return output ? { blob: await blob(output), mode: '사진 종이 보정' } : null;
    } finally { URL.revokeObjectURL(url); }
  }
  return { guide, make, blob, crop, fromVideo, fromFile };
})();
