/**
 * Google Drive Integration for Flicka Performance Studio
 * - Automatically saves uploaded files directly into Google Drive
 * - Organizes into two distinct folders:
 *   1. "Flicka Studio - Reference Images" (for reference briefs & inspirations)
 *   2. "Flicka Studio - Finish Images" (for finished creative deliverables)
 */

import firebaseConfigJson from '../../firebase-applet-config.json';

const FOLDER_NAMES = {
  reference: 'Flicka Studio - Reference Images',
  finish: 'Flicka Studio - Finish Images',
} as const;

export type DriveFolderType = 'reference' | 'finish';

interface DriveFolderCache {
  reference?: string;
  finish?: string;
}

interface StoredToken {
  access_token: string;
  expires_at: number;
}

const TOKEN_STORAGE_KEY = 'flicka_gdrive_token';
const FOLDERS_STORAGE_KEY = 'flicka_gdrive_folders';

let cachedToken: StoredToken | null = null;
let tokenClientInstance: any = null;

// Initialize token from storage
try {
  const saved = sessionStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem(TOKEN_STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.expires_at && parsed.expires_at > Date.now()) {
      cachedToken = parsed;
    }
  }
} catch {
  // Ignore parsing errors
}

/**
 * Load Google Identity Services (GIS) library dynamically
 */
export async function loadGisScript(): Promise<void> {
  if (typeof window === 'undefined') return;
  if ((window as any).google?.accounts?.oauth2) return;

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

/**
 * Get active access token, refreshing if necessary
 */
export async function getDriveAccessToken(interactive = true): Promise<string | null> {
  if (cachedToken && cachedToken.expires_at > Date.now() + 60000) {
    return cachedToken.access_token;
  }

  await loadGisScript();

  if (!(window as any).google?.accounts?.oauth2) {
    console.warn('Google Identity Services not available');
    return null;
  }

  return new Promise((resolve) => {
    try {
      const clientId =
        (firebaseConfigJson as any).oAuthClientId ||
        '81056256680-atdasdcvk4lgbe37loekpsdi1vql563f.apps.googleusercontent.com';

      tokenClientInstance = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly',
        callback: (response: any) => {
          if (response.error) {
            console.warn('Google Drive OAuth error:', response.error);
            resolve(null);
            return;
          }
          if (response.access_token) {
            const expiresIn = (parseInt(response.expires_in, 10) || 3599) * 1000;
            const tokenData: StoredToken = {
              access_token: response.access_token,
              expires_at: Date.now() + expiresIn,
            };
            cachedToken = tokenData;
            sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
            resolve(response.access_token);
          } else {
            resolve(null);
          }
        },
      });

      if (interactive) {
        tokenClientInstance.requestAccessToken({ prompt: '' });
      } else {
        tokenClientInstance.requestAccessToken({ prompt: 'none' });
      }
    } catch (err) {
      console.warn('Failed to initiate Google OAuth token client:', err);
      resolve(null);
    }
  });
}

/**
 * Get or create Google Drive Folder for Reference vs Finish
 */
export async function getOrCreateDriveFolder(
  folderType: DriveFolderType,
  accessToken: string
): Promise<{ folderId: string; folderUrl: string } | null> {
  const folderName = FOLDER_NAMES[folderType];

  try {
    // 1. Check folder in local cache first
    let cachedFolders: DriveFolderCache = {};
    try {
      const saved = localStorage.getItem(FOLDERS_STORAGE_KEY);
      if (saved) cachedFolders = JSON.parse(saved);
    } catch {}

    if (cachedFolders[folderType]) {
      return {
        folderId: cachedFolders[folderType]!,
        folderUrl: `https://drive.google.com/drive/folders/${cachedFolders[folderType]}`,
      };
    }

    // 2. Query Drive for existing folder with this exact name
    const query = encodeURIComponent(`mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`);
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const found = searchData.files[0];
        cachedFolders[folderType] = found.id;
        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(cachedFolders));
        return {
          folderId: found.id,
          folderUrl: found.webViewLink || `https://drive.google.com/drive/folders/${found.id}`,
        };
      }
    }

    // 3. Create folder if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: `Automated ${folderType === 'reference' ? 'reference images' : 'finished deliverables'} storage for Flicka Performance Studio`,
      }),
    });

    if (createRes.ok) {
      const created = await createRes.json();
      cachedFolders[folderType] = created.id;
      localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(cachedFolders));
      return {
        folderId: created.id,
        folderUrl: `https://drive.google.com/drive/folders/${created.id}`,
      };
    }

    return null;
  } catch (err) {
    console.error('Error getting/creating Drive folder:', err);
    return null;
  }
}

export interface DriveUploadResult {
  success: boolean;
  driveFileId?: string;
  driveWebViewLink?: string;
  folderName: string;
  folderType: DriveFolderType;
  fileName: string;
  error?: string;
}

/**
 * Upload a file directly to the dedicated Google Drive folder (Reference or Finish)
 */
export async function uploadFileToGoogleDrive(
  file: File | Blob,
  fileName: string,
  folderType: DriveFolderType
): Promise<DriveUploadResult> {
  try {
    const token = await getDriveAccessToken(true);
    if (!token) {
      return {
        success: false,
        folderName: FOLDER_NAMES[folderType],
        folderType,
        fileName,
        error: 'Google Drive authorization required.',
      };
    }

    const folderInfo = await getOrCreateDriveFolder(folderType, token);
    const parentFolderId = folderInfo?.folderId;

    // Metadata payload
    const metadata = {
      name: fileName,
      mimeType: file.type || 'image/png',
      parents: parentFolderId ? [parentFolderId] : undefined,
      description: `Uploaded from Flicka Performance Studio (${folderType === 'reference' ? 'Reference' : 'Finish'} deliverable)`,
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const fileReader = new FileReader();
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);
      fileReader.onerror = (e) => reject(e);
      fileReader.readAsArrayBuffer(file);
    });

    const multipartRequestBody = new Blob(
      [
        delimiter,
        'Content-Type: application/json; charset=UTF-8\r\n\r\n',
        JSON.stringify(metadata),
        delimiter,
        `Content-Type: ${file.type || 'application/octet-stream'}\r\n`,
        'Content-Transfer-Encoding: binary\r\n\r\n',
        arrayBuffer,
        closeDelimiter,
      ],
      { type: `multipart/related; boundary=${boundary}` }
    );

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,thumbnailLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.warn('Google Drive file upload failed:', errText);
      return {
        success: false,
        folderName: FOLDER_NAMES[folderType],
        folderType,
        fileName,
        error: `Drive upload returned status ${uploadRes.status}`,
      };
    }

    const data = await uploadRes.json();
    return {
      success: true,
      driveFileId: data.id,
      driveWebViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
      folderName: FOLDER_NAMES[folderType],
      folderType,
      fileName,
    };
  } catch (err: any) {
    console.error('Failed to upload file to Google Drive:', err);
    return {
      success: false,
      folderName: FOLDER_NAMES[folderType],
      folderType,
      fileName,
      error: err?.message || 'Upload exception',
    };
  }
}
