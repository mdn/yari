/* global fetch */
//import imagemin from "imagemin";
//import imageminPngquant from "imagemin-pngquant";
//import imageminMozjpeg from "imagemin-mozjpeg";
//import imageminGifsicle from "imagemin-gifsicle";
//import imageminSvgo from "imagemin-svgo";

export async function downloadAndResizeImage(src) {
  const imageResponse = await fetch(src);
  const imageBuffer = await imageResponse.arrayBuffer();
  const contentType = imageResponse.headers.get("content-type");
  //try {
  //  const compressedImageBuffer = await imagemin.buffer(imageBuffer, {
  //    plugins: [getImageminPlugin(contentType)],
  //  });
  //  if (compressedImageBuffer.length < imageBuffer.length) {
  //    return { buf: compressedImageBuffer, contentType };
  //  }
  //} catch (e) {
  //  console.error(e);
  //}
  return { buf: imageBuffer, contentType };
}

//export function getImageminPlugin(contentType) {
//  switch (contentType) {
//    case "image/jpeg":
//      return imageminMozjpeg();
//    case "image/png":
//      return imageminPngquant();
//    case "image/gif":
//      return imageminGifsicle();
//    case "image/svg+xml":
//      return imageminSvgo();
//    default:
//      throw new Error(`No imagemin plugin for ${extension}`);
//  }
//}
