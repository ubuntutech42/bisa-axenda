"use client";

import { getApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseConfig } from "@/firebase/config";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function isTaskCoverUploadAvailable(): boolean {
  return Boolean(firebaseConfig.storageBucket);
}

/**
 * Uploads a task cover image to Firebase Storage and returns the public URL.
 * Path: boards/{boardId}/tasks/{taskId}/cover for existing tasks,
 * or boards/{boardId}/covers/{randomId} for new tasks (before task is created).
 */
export async function uploadTaskCover(
  file: File,
  boardId: string,
  taskId?: string
): Promise<string> {
  if (!firebaseConfig.storageBucket) {
    throw new Error(
      "Firebase Storage não está configurado. Defina NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET."
    );
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF."
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("A imagem deve ter no máximo 5MB.");
  }

  const app = getApp();
  const storage = getStorage(app, firebaseConfig.storageBucket);
  const path = taskId
    ? `boards/${boardId}/tasks/${taskId}/cover`
    : `boards/${boardId}/covers/${crypto.randomUUID()}`;
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
  });
  return getDownloadURL(snapshot.ref);
}
