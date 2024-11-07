import { BlobServiceClient } from "@azure/storage-blob"

// Ensure these environment variables are properly set in your Next.js app
const sasToken = process.env.NEXT_PUBLIC_AZURE_STORAGE_SAS_TOKEN
const containerName = process.env.NEXT_PUBLIC_AZURE_STORAGE_CONTAINER_NAME
const storageAccountName = process.env.NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT_NAME

// Helper function to upload an image to Azure Blob Storage
export async function uploadImageToAzure(file: File): Promise<string> {
  // Ensure Azure Blob Storage configurations are complete
  if (!sasToken || !containerName || !storageAccountName) {
    throw new Error("Azure Storage configuration is incomplete")
  }

  // Create BlobServiceClient with the SAS token
  const blobServiceClient = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
  )

  // Get a reference to the container
  const containerClient = blobServiceClient.getContainerClient(containerName)

  // Create a unique blob name using timestamp
  const blobName = `${Date.now()}-${file.name}`
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  try {
    // Upload the file to Azure Blob Storage with correct content type
    await blockBlobClient.uploadData(file, {
      blobHTTPHeaders: { blobContentType: file.type }
    })

    // Return the URL of the uploaded image
    return blockBlobClient.url
  } catch (error) {
    // Handle any errors that occur during the upload
    console.error("Error uploading image to Azure Blob Storage:", error)
    throw new Error("Image upload failed")
  }
}
