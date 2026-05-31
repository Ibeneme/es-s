const B2 = require("backblaze-b2");

const applicationKeyId = process.env.APPLICATION_KEY_ID;
const applicationKey = process.env.APPLICATION_KEY;
const bucketId = process.env.BUCKET_ID;
const bucketName = process.env.BUCKET_NAME;

async function uploadToBackblaze(fileBuffer, originalName, folder = "uploads") {
  console.log("➡️ uploadToBackblaze called");

  try {
    const b2 = new B2({
      applicationKeyId,
      applicationKey,
    });

    console.log("🔑 Authorizing B2...");
    await b2.authorize();

    const { data: uploadData } = await b2.getUploadUrl({ bucketId });

    const timestamp = Date.now();
    const safeName = originalName.replace(/\s+/g, "_");
    const fileName = `${folder}/${timestamp}_${safeName}`;

    console.log(`📦 Uploading ${fileName} to B2...`);
    const { data: uploadedData } = await b2.uploadFile({
      uploadUrl: uploadData.uploadUrl,
      uploadAuthToken: uploadData.authorizationToken,
      fileName,
      data: fileBuffer,
    });

    console.log("✅ File uploaded successfully");

    // 🔒 FIX: Generate a temporary download authorization token (e.g., valid for 86400 seconds = 1 day)
    console.log("🎟️ Generating temporary download authorization token...");
    const { data: authData } = await b2.getDownloadAuthorization({
      bucketId,
      fileNamePrefix: fileName, 
      validDurationInSeconds: 86400, // 24 hours
    });

    // Construct the authenticated download URL with the authorization token parameter appended
    const downloadUrl = `https://f005.backblazeb2.com/file/${bucketName}/${uploadedData.fileName}?Authorization=${authData.authorizationToken}`;
    
    return downloadUrl;
  } catch (error) {
    console.error("❌ B2 Upload Error:", error.response?.data || error);
    throw new Error(
      `Failed to upload file to Backblaze B2: ${error.message || error}`
    );
  }
}

module.exports = { uploadToBackblaze };