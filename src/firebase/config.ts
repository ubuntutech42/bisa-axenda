const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`);
  return value;
};

export const firebaseConfig = {
  projectId: required("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  appId: required("NEXT_PUBLIC_FIREBASE_APP_ID"),
  apiKey: required("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: required("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "",
  messagingSenderId: required("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
};
