// import rive from "@rive-app/canvas";

// const layout = new rive.Layout({
//     fit: rive.Fit.Contain,
//     minX: 0,
//     minY: 0,
//     maxX: 100,
//     maxY: 100,
// })

// const r = new rive.Rive({
//     src: "/assets/stickers/Stickers.riv",
//     canvas: document.getElementById("heart-sticker"),
//     artboard: "Heart Sticker",
//     autoplay: false,
//     layout: layout,
//     onLoad: () => {
//         r.play();
//     },
// });

const heartSelection = new rive.Rive({
    src: "/assets/stickers/Stickers.riv",
    canvas: document.getElementById("heart-sticker"),
    autoplay: true,
    artboard: "Heart Sticker",
    onLoad: () => {
      heartSelection.resizeDrawingSurfaceToCanvas();
    },
  });

  const starSelection = new rive.Rive({
    src: "/assets/stickers/Stickers.riv",
    canvas: document.getElementById("star-sticker"),
    autoplay: true,
    artboard: "Star Sticker",
    onLoad: () => {
      starSelection.resizeDrawingSurfaceToCanvas();
    },
  });

  const cloudSelection = new rive.Rive({
    src: "/assets/stickers/Stickers.riv",
    canvas: document.getElementById("cloud-sticker"),
    autoplay: true,
    artboard: "Sad Cloud Sticker",
    onLoad: () => {
      cloudSelection.resizeDrawingSurfaceToCanvas();
    },
  });