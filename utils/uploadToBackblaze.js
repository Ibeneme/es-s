const B2 = require("backblaze-b2");
const sharp = require("sharp");

const applicationKeyId = process.env.APPLICATION_KEY_ID;
const applicationKey = process.env.APPLICATION_KEY;
const bucketId = process.env.BUCKET_ID;
const bucketName = process.env.BUCKET_NAME;

async function uploadToBackblaze(fileBuffer, originalName, folder = "uploads") {
  console.log("➡️ uploadToBackblaze called");

  try {
    // 1. Compress Image before upload
    let finalBuffer = fileBuffer;
    let fileName = originalName;

    if (originalName.match(/\.(jpg|jpeg|png|webp|tiff)$/i)) {
      console.log("🖼️ Compressing image...");
      finalBuffer = await sharp(fileBuffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      // Update extension to .webp
      const baseName = originalName.replace(/\.[^/.]+$/, "");
      fileName = `${baseName}.webp`;
    }

    const b2 = new B2({ applicationKeyId, applicationKey });
    await b2.authorize();

    const { data: uploadData } = await b2.getUploadUrl({ bucketId });

    const timestamp = Date.now();
    const safeName = fileName.replace(/\s+/g, "_");
    const fullFileName = `${folder}/${timestamp}_${safeName}`;

    console.log(`📦 Uploading ${fullFileName} to B2...`);
    const { data: uploadedData } = await b2.uploadFile({
      uploadUrl: uploadData.uploadUrl,
      uploadAuthToken: uploadData.authorizationToken,
      fileName: fullFileName,
      data: finalBuffer,
    });

    console.log("🎟️ Generating download token...");
    const { data: authData } = await b2.getDownloadAuthorization({
      bucketId,
      fileNamePrefix: fullFileName,
      validDurationInSeconds: 86400,
    });

    return `https://f005.backblazeb2.com/file/${bucketName}/${uploadedData.fileName}?Authorization=${authData.authorizationToken}`;
  } catch (error) {
    console.error("❌ B2 Upload Error:", error);
    throw new Error(`Failed to upload: ${error.message}`);
  }
}

async function deleteFromBackblaze(fileUrl) {
  try {
    const b2 = new B2({ applicationKeyId, applicationKey });
    await b2.authorize();

    const urlParts = new URL(fileUrl);
    let fileName = decodeURIComponent(
      urlParts.pathname.split(`/file/${bucketName}/`)[1]
    );
    fileName = fileName.split("?")[0];

    console.log(`🗑️ Deleting from B2: ${fileName}`);
    await b2.deleteFileVersion({ bucketId, fileName });
    console.log("✅ File deleted successfully");
  } catch (error) {
    console.error("❌ B2 Deletion Error:", error);
  }
}

module.exports = { uploadToBackblaze, deleteFromBackblaze };
