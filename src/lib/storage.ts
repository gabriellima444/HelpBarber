import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { FirebaseStorage } from 'firebase/storage';

/**
 * Uploads a base64 image to Firebase Storage and returns the public download URL.
 * 
 * @param storage The FirebaseStorage instance
 * @param path The path in storage where the image will be saved
 * @param base64Str The base64 string of the image
 * @returns The public download URL
 */
export async function uploadBase64ToStorage(
  storage: FirebaseStorage,
  path: string,
  base64Str: string
): Promise<string> {
  const storageRef = ref(storage, path);
  
  // base64Str might contain the prefix "data:image/jpeg;base64,"
  // uploadString handles "data_url"
  await uploadString(storageRef, base64Str, 'data_url');
  
  return await getDownloadURL(storageRef);
}
