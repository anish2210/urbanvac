import { google } from "googleapis";
import { Readable } from "stream";

// Google Drive configuration
const FOLDER_ID = "12kixcC0Tjda9HT_BmKqPfwckDRAYnfZ7"; // invoices folder

// Initialize Google Drive API
const initializeDrive = () => {
  try {
    // Parse service account credentials from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    // scopes: ["https://www.googleapis.com/auth/drive.file"],

    const drive = google.drive({ version: "v3", auth });
    return drive;
  } catch (error) {
    console.error("Failed to initialize Google Drive:", error);
    throw new Error("Google Drive initialization failed");
  }
};

// Upload PDF to Google Drive
export const uploadPDFToDrive = async (pdfBuffer, fileName) => {
  try {
    const drive = initializeDrive();

    const fileMetadata = {
      name: fileName,
      parents: [FOLDER_ID],
      mimeType: "application/pdf",
    };

    const media = {
      mimeType: "application/pdf",
      body: Readable.from(pdfBuffer),
    };

    // Upload file
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink, webContentLink",
    });

    // Make the file publicly accessible (anyone with the link can view/download)
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Generate direct download link
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.data.id}`;

    console.log("PDF uploaded to Google Drive:", file.data.name);

    return {
      fileId: file.data.id,
      fileName: file.data.name,
      downloadUrl: downloadUrl,
      viewUrl: file.data.webViewLink,
    };
  } catch (error) {
    console.error("Error uploading to Google Drive:", error);
    throw new Error(`Failed to upload PDF to Google Drive: ${error.message}`);
  }
};

// Delete PDF from Google Drive (optional - for cleanup)
export const deletePDFFromDrive = async (fileId) => {
  try {
    const drive = initializeDrive();
    await drive.files.delete({ fileId });
    console.log("PDF deleted from Google Drive:", fileId);
    return true;
  } catch (error) {
    console.error("Error deleting from Google Drive:", error);
    throw new Error(`Failed to delete PDF from Google Drive: ${error.message}`);
  }
};

export default { uploadPDFToDrive, deletePDFFromDrive };
