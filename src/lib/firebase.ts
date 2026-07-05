/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  initializeFirestore,
  memoryLocalCache,
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

import { Product, Category, Brand, Offer, Coupon, Supplier, StoreSettings, Address, Notification, Order, Review, User } from '../types';
import { CATEGORIES, BRANDS, PRODUCTS, COUPONS, OFFERS, SUPPLIERS, DEFAULT_STORE_SETTINGS, DEFAULT_ADDRESSES } from '../data/mockData';
import firebaseConfigJson from '../../firebase-applet-config.json';

const metaEnv = (import.meta as any).env || {};

// Load configuration from environment variables (User's custom project "Jitu Moni Grocery")
export const firebaseConfig = {
  projectId: firebaseConfigJson.projectId || metaEnv.VITE_FIREBASE_PROJECT_ID || "",
  appId: firebaseConfigJson.appId || metaEnv.VITE_FIREBASE_APP_ID || "",
  apiKey: firebaseConfigJson.apiKey || metaEnv.VITE_FIREBASE_API_KEY || "",
  authDomain: firebaseConfigJson.authDomain || metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "",
  firestoreDatabaseId: firebaseConfigJson.firestoreDatabaseId || metaEnv.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "",
  storageBucket: firebaseConfigJson.storageBucket || metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: firebaseConfigJson.messagingSenderId || metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || ""
};

export const isFirebaseConfigured = !!(
  firebaseConfig.projectId &&
  firebaseConfig.apiKey &&
  firebaseConfig.appId
);

// If custom project is not configured, we use dummy values to prevent SDK crash,
// and prompt the user to configure their project in the UI.
const dummyConfig = {
  projectId: "jitu-moni-grocery-placeholder",
  appId: "1:111111111111:web:1111111111111111111111",
  apiKey: "AIzaSyPlaceholderKey-PleaseConfigureInSettings",
  authDomain: "jitu-moni-grocery-placeholder.firebaseapp.com",
  firestoreDatabaseId: "",
  storageBucket: "jitu-moni-grocery-placeholder.firebasestorage.app",
  messagingSenderId: "111111111111"
};

const activeConfig = isFirebaseConfigured ? firebaseConfig : dummyConfig;

const app = initializeApp(activeConfig);
export const auth = getAuth(app);

// Initialize Firestore with memory-only cache to disable persistent offline cache issues
export const db = (activeConfig.firestoreDatabaseId && activeConfig.firestoreDatabaseId !== "(default)")
  ? initializeFirestore(app, { localCache: memoryLocalCache() }, activeConfig.firestoreDatabaseId)
  : initializeFirestore(app, { localCache: memoryLocalCache() });

export const storage = getStorage(app);

// Helper to handle image uploads cleanly (supports base64 and URLs)
export async function uploadImage(path: string, base64OrUrl: string): Promise<string> {
  if (!base64OrUrl.startsWith('data:')) {
    // If it's already an HTTP URL, return as is
    return base64OrUrl;
  }
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadString(storageRef, base64OrUrl, 'data_url');
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn("Storage upload failed, falling back to local storage representation:", error);
    return base64OrUrl;
  }
}

// Ensure database collections are pre-seeded with beautiful grocery data
export async function seedDatabaseIfEmpty() {
  if (!isFirebaseConfigured) {
    console.warn('Firebase is not configured. Skipping automatic database seeding.');
    return;
  }
  
  console.log('Verifying and seeding Firestore database collections...');
  const errors: string[] = [];

  // Helper to run seed operations in isolated try-catch blocks
  async function runSeedTask(name: string, task: () => Promise<void>) {
    try {
      await task();
    } catch (err: any) {
      console.error(`Error during seeding of ${name}:`, err);
      errors.push(`${name}: ${err.message || String(err)}`);
    }
  }

  // 1. Users & Admin document only
  await runSeedTask('Users & Admin', async () => {
    const userSnap = await getDocs(collection(db, 'users'));
    if (userSnap.empty) {
      console.log('Seeding admin user document only...');
      const adminRef = doc(db, 'users', 'rihankhan-admin');
      await setDoc(adminRef, {
        id: 'rihankhan-admin',
        uid: 'rihankhan-admin',
        name: 'Rihan Khan',
        fullName: 'Rihan Khan',
        email: 'rihankhanrb1786@gmail.com',
        phone: '+91 9999999999',
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        photoURL: ''
      });

      // 2. Cart (Subcollection)
      console.log('Seeding starter admin cart...');
      await setDoc(doc(db, 'users', 'rihankhan-admin', 'cart', PRODUCTS[0].id), {
        product: PRODUCTS[0],
        quantity: 2
      });

      // 3. Wishlist (Subcollection)
      console.log('Seeding starter admin wishlist...');
      await setDoc(doc(db, 'users', 'rihankhan-admin', 'wishlist', 'items'), {
        ids: [PRODUCTS[0].id]
      });
    }
  });

  // 4. Categories
  await runSeedTask('Categories', async () => {
    const catSnap = await getDocs(collection(db, 'categories'));
    if (catSnap.empty) {
      console.log('Seeding categories...');
      for (const cat of CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
    }
  });

  // 5. Brands
  await runSeedTask('Brands', async () => {
    const brandSnap = await getDocs(collection(db, 'brands'));
    if (brandSnap.empty) {
      console.log('Seeding brands...');
      for (const brand of BRANDS) {
        await setDoc(doc(db, 'brands', brand.id), brand);
      }
    }
  });

  // 6. Products
  await runSeedTask('Products', async () => {
    const prodSnap = await getDocs(collection(db, 'products'));
    if (prodSnap.empty) {
      console.log('Seeding products...');
      for (const prod of PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
    }
  });

  // 7. Offers & Banners
  await runSeedTask('Offers & Banners', async () => {
    const offerSnap = await getDocs(collection(db, 'offers'));
    if (offerSnap.empty) {
      console.log('Seeding offers...');
      for (const offer of OFFERS) {
        await setDoc(doc(db, 'offers', offer.id), offer);
      }
    }

    const bannerSnap = await getDocs(collection(db, 'banners'));
    if (bannerSnap.empty) {
      console.log('Seeding banners...');
      for (const offer of OFFERS) {
        await setDoc(doc(db, 'banners', offer.id), {
          id: offer.id,
          title: offer.title,
          subtitle: offer.subtitle,
          image: offer.image || "",
          code: offer.code || "",
          discountText: offer.discountText || "",
          bgGradient: "from-green-600 to-emerald-600"
        });
      }
    }
  });

  // 8. Coupons
  await runSeedTask('Coupons', async () => {
    const couponSnap = await getDocs(collection(db, 'coupons'));
    if (couponSnap.empty) {
      console.log('Seeding coupons...');
      for (const coupon of COUPONS) {
        await setDoc(doc(db, 'coupons', coupon.id), coupon);
      }
    }
  });

  // 9. Suppliers
  await runSeedTask('Suppliers', async () => {
    const supplierSnap = await getDocs(collection(db, 'suppliers'));
    if (supplierSnap.empty) {
      console.log('Seeding suppliers...');
      for (const sup of SUPPLIERS) {
        await setDoc(doc(db, 'suppliers', sup.id), sup);
      }
    }
  });

  // 10. Reviews
  await runSeedTask('Reviews', async () => {
    const reviewSnap = await getDocs(collection(db, 'reviews'));
    if (reviewSnap.empty) {
      console.log('Seeding sample reviews...');
      const sampleReview = {
        id: 'rev-sample',
        productId: PRODUCTS[0].id,
        userId: 'rihankhan-admin',
        userName: 'Rihan Khan',
        rating: 5,
        comment: 'Excellent quality and lightning-fast delivery! Strongly recommended.',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'reviews', 'rev-sample'), sampleReview);
    }
  });

  // 11. Orders
  await runSeedTask('Orders', async () => {
    const orderSnap = await getDocs(collection(db, 'orders'));
    if (orderSnap.empty) {
      console.log('Seeding sample orders...');
      const sampleOrder = {
        id: 'ord-sample',
        userId: 'rihankhan-admin',
        userName: 'Rihan Khan',
        userEmail: 'rihankhanrb1786@gmail.com',
        items: [
          {
            product: PRODUCTS[0],
            quantity: 1
          }
        ],
        totalAmount: PRODUCTS[0].price,
        status: 'Delivered',
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'Paid',
        createdAt: new Date().toISOString(),
        address: {
          id: 'addr-sample',
          fullName: 'Rihan Khan',
          phone: '+91 9999999999',
          street: '123 Grocery Lane',
          city: 'Guwahati',
          state: 'Assam',
          zipCode: '781001',
          isDefault: true
        },
        trackingSteps: [
          { name: 'Order Placed', status: 'completed', date: new Date().toLocaleDateString(), time: '10:00 AM' },
          { name: 'Processing', status: 'completed', date: new Date().toLocaleDateString(), time: '11:00 AM' },
          { name: 'Out for Delivery', status: 'completed', date: new Date().toLocaleDateString(), time: '12:00 PM' },
          { name: 'Delivered', status: 'completed', date: new Date().toLocaleDateString(), time: '12:30 PM' }
        ]
      };
      await setDoc(doc(db, 'orders', 'ord-sample'), sampleOrder);
    }
  });

  // 12. Store Settings
  await runSeedTask('Store Settings', async () => {
    const settingsSnap = await getDocs(collection(db, 'settings'));
    if (settingsSnap.empty) {
      console.log('Seeding store settings...');
      await setDoc(doc(db, 'settings', 'store-config'), DEFAULT_STORE_SETTINGS);
    }
  });

  // Check for critical seeding failures
  if (errors.length > 0) {
    const criticalFailures = errors.filter(e => 
      e.startsWith('Categories') || 
      e.startsWith('Products') || 
      e.startsWith('Store Settings')
    );
    if (criticalFailures.length > 0) {
      throw new Error(`Database seeding failed for critical collections:\n${criticalFailures.join('\n')}`);
    }
  }

  console.log('All Firestore collections successfully verified and initialized.');
}

// Force seed / migrate all collections to a custom Firebase project
export async function forceSeedDatabase(onProgress: (msg: string) => void) {
  try {
    onProgress('Starting migration to Firebase...');
    
    onProgress('Migrating Categories...');
    for (const cat of CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), cat);
    }
    onProgress(`Migrated ${CATEGORIES.length} Categories successfully.`);

    onProgress('Migrating Brands...');
    for (const brand of BRANDS) {
      await setDoc(doc(db, 'brands', brand.id), brand);
    }
    onProgress(`Migrated ${BRANDS.length} Brands successfully.`);

    onProgress('Migrating Products...');
    for (const prod of PRODUCTS) {
      await setDoc(doc(db, 'products', prod.id), prod);
    }
    onProgress(`Migrated ${PRODUCTS.length} Products successfully.`);

    onProgress('Migrating Offers...');
    for (const offer of OFFERS) {
      await setDoc(doc(db, 'offers', offer.id), offer);
    }
    onProgress(`Migrated ${OFFERS.length} Offers successfully.`);

    onProgress('Migrating Coupons...');
    for (const coupon of COUPONS) {
      await setDoc(doc(db, 'coupons', coupon.id), coupon);
    }
    onProgress(`Migrated ${COUPONS.length} Coupons successfully.`);

    onProgress('Migrating Suppliers...');
    for (const sup of SUPPLIERS) {
      await setDoc(doc(db, 'suppliers', sup.id), sup);
    }
    onProgress(`Migrated ${SUPPLIERS.length} Suppliers successfully.`);

    onProgress('Migrating Store Settings...');
    await setDoc(doc(db, 'settings', 'store-config'), DEFAULT_STORE_SETTINGS);
    onProgress('Store settings configuration migrated successfully!');

    onProgress('Database migration & seeding completed successfully!');
  } catch (error: any) {
    console.error('Migration error:', error);
    onProgress(`Error: ${error.message || error}`);
    throw error;
  }
}

// -----------------------------------------------------------------
// AUTHENTICATION OPERATIONS
// -----------------------------------------------------------------

// Create/Update user metadata doc in Firestore
export async function syncUserDoc(uid: string, data: Partial<User>) {
  const userRef = doc(db, 'users', uid);
  const now = new Date().toISOString();
  
  const emailVal = data.email || '';
  const calculatedRole = (emailVal === 'rihankhanrb1786@gmail.com' || emailVal?.includes('admin')) 
    ? 'admin' 
    : (data.role || 'customer');

  const nameVal = data.fullName || data.name || 'Anonymous User';

  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      const newUser: User = {
        id: uid,
        uid: uid,
        name: nameVal,
        fullName: nameVal,
        email: emailVal,
        phone: data.phone || '',
        role: calculatedRole,
        photoURL: data.photoURL || '',
        createdAt: now,
        lastLogin: now
      };
      try {
        await setDoc(userRef, newUser);
      } catch (writeErr: any) {
        console.warn("Could not save new user document to Firestore (offline):", writeErr.message || writeErr);
      }
      return newUser;
    } else {
      const existing = userSnap.data() as User;
      const updatedFields: Partial<User> = {
        lastLogin: now
      };
      
      if (existing.email === 'rihankhanrb1786@gmail.com' && existing.role !== 'admin') {
        updatedFields.role = 'admin';
      }
      
      if (!existing.uid) updatedFields.uid = uid;
      if (!existing.fullName) updatedFields.fullName = existing.name || nameVal;
      if (data.photoURL && !existing.photoURL) updatedFields.photoURL = data.photoURL;
      if (data.phone && !existing.phone) updatedFields.phone = data.phone;

      try {
        await updateDoc(userRef, updatedFields);
      } catch (writeErr: any) {
        console.warn("Could not update user document in Firestore (offline):", writeErr.message || writeErr);
      }
      return { ...existing, ...updatedFields };
    }
  } catch (error: any) {
    console.log("Could not sync user document because database is offline or unreachable. Using local fallback representation.");
    return {
      id: uid,
      uid: uid,
      name: nameVal,
      fullName: nameVal,
      email: emailVal,
      phone: data.phone || '',
      role: calculatedRole,
      photoURL: data.photoURL || '',
      createdAt: now,
      lastLogin: now,
      ...data
    } as User;
  }
}

// Ensure Firebase Auth is fully initialized and configured
export function ensureAuthInitialized() {
  if (!auth) {
    throw new Error("Firebase Authentication is not initialized. Please verify your configuration.");
  }
  if (!isFirebaseConfigured) {
    throw new Error("Firebase project is not configured. Please supply your environment variables or config files.");
  }
  if (activeConfig.projectId !== "jitu-moni-grocery") {
    throw new Error(`The application is pointed to a different Firebase project "${activeConfig.projectId}". Please connect only your "jitu-moni-grocery" project.`);
  }
}

// Handle auth errors with explicit user-friendly instructions for configuration missing or disabled providers
export function handleAuthError(error: any, provider: string): never {
  const code = error?.code || "";
  const message = error?.message || "";
  
  if (code === "auth/configuration-not-found" || code === "auth/operation-not-allowed") {
    console.warn(`Firebase Auth provider "${provider}" is not fully configured/enabled in the Firebase Console:`, error);
  } else if (code !== "auth/invalid-credential" && code !== "auth/wrong-password" && code !== "auth/user-not-found" && code !== "auth/popup-closed-by-user") {
    console.log(`Auth flow info for "${provider}":`, error);
  }
  
  if (code === "auth/configuration-not-found" || message.includes("configuration-not-found")) {
    throw new Error(
      `The "${provider}" sign-in method is not enabled in your Firebase console. Please go to your Firebase Console (Authentication -> Sign-in method), and enable it for project "Jitu Moni Grocery".`
    );
  }
  if (code === "auth/operation-not-allowed" || message.includes("operation-not-allowed")) {
    throw new Error(
      `The "${provider}" provider is disabled. Please enable it in the Firebase Console under Authentication -> Sign-in method for project "Jitu Moni Grocery".`
    );
  }
  if (code === "auth/email-already-in-use" || message.includes("email-already-in-use")) {
    throw new Error("This email is already in use by another account. Please try signing in instead.");
  }
  if (code === "auth/weak-password" || message.includes("weak-password")) {
    throw new Error("The password is too weak. Please use at least 6 characters.");
  }
  if (code === "auth/invalid-email" || message.includes("invalid-email")) {
    throw new Error("Please enter a valid email address.");
  }
  if (
    code === "auth/user-not-found" || 
    message.includes("user-not-found") || 
    code === "auth/wrong-password" || 
    message.includes("wrong-password") || 
    code === "auth/invalid-credential" || 
    message.includes("invalid-credential")
  ) {
    throw new Error("Invalid credentials. Please verify your email and password.");
  }
  if (code === "auth/popup-closed-by-user" || message.includes("popup-closed-by-user")) {
    throw new Error("Google Sign-In popup was closed before completion.");
  }
  
  throw new Error(message || `Authentication failed for provider "${provider}".`);
}

// Email & Password login
export async function loginWithEmail(email: string, password: string) {
  ensureAuthInitialized();
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return await syncUserDoc(cred.user.uid, { email: cred.user.email || '' });
  } catch (error) {
    return handleAuthError(error, "Email/Password");
  }
}

// Email & Password signup
export async function signUpWithEmail(email: string, password: string, name: string, phone: string, role: 'customer' | 'admin' | 'delivery' = 'customer') {
  ensureAuthInitialized();
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    return await syncUserDoc(cred.user.uid, { email, name, fullName: name, phone, role });
  } catch (error) {
    return handleAuthError(error, "Email/Password");
  }
}

// Google Authentication
export async function loginWithGoogle() {
  ensureAuthInitialized();
  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    return await syncUserDoc(cred.user.uid, {
      email: cred.user.email || '',
      name: cred.user.displayName || 'Google User',
      fullName: cred.user.displayName || 'Google User',
      phone: cred.user.phoneNumber || '',
      photoURL: cred.user.photoURL || ''
    });
  } catch (error) {
    return handleAuthError(error, "Google");
  }
}

// Guest Login (Anonymous)
export async function loginWithGuest() {
  ensureAuthInitialized();
  try {
    const cred = await signInAnonymously(auth);
    return await syncUserDoc(cred.user.uid, {
      name: 'Guest User',
      email: 'guest@jitumonigrocery.com',
      role: 'customer'
    });
  } catch (error) {
    return handleAuthError(error, "Anonymous/Guest");
  }
}

// Phone simulated OTP Login (designed to bypass iframe limitations reliably)
export async function loginWithPhoneSimulated(phone: string, name: string) {
  ensureAuthInitialized();
  try {
    // Let's create an elegant pseudo-authenticator using a fixed/salted ID based on phone number
    const fakeUid = 'phone-user-' + btoa(phone).replace(/=/g, '').substring(0, 15);
    // Create / Retrieve doc
    return await syncUserDoc(fakeUid, {
      name: name || 'Phone User',
      phone,
      role: 'customer'
    });
  } catch (error) {
    return handleAuthError(error, "Phone Simulated OTP");
  }
}

// Logout
export async function logoutUser() {
  ensureAuthInitialized();
  try {
    await signOut(auth);
  } catch (error) {
    return handleAuthError(error, "Logout");
  }
}

// -----------------------------------------------------------------
// CUSTOMER & FIRESTORE REAL-TIME OPERATIONS
// -----------------------------------------------------------------

// Listen to products
export function listenProducts(callback: (products: Product[]) => void) {
  return onSnapshot(collection(db, 'products'), (snap) => {
    const list: Product[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Product);
    });
    callback(list);
  });
}

// Listen to categories
export function listenCategories(callback: (categories: Category[]) => void) {
  return onSnapshot(collection(db, 'categories'), (snap) => {
    const list: Category[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Category);
    });
    callback(list);
  });
}

// Listen to brands
export function listenBrands(callback: (brands: Brand[]) => void) {
  return onSnapshot(collection(db, 'brands'), (snap) => {
    const list: Brand[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Brand);
    });
    callback(list);
  });
}

// Listen to offers
export function listenOffers(callback: (offers: Offer[]) => void) {
  return onSnapshot(collection(db, 'offers'), (snap) => {
    const list: Offer[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Offer);
    });
    callback(list);
  });
}

// Listen to coupons
export function listenCoupons(callback: (coupons: Coupon[]) => void) {
  return onSnapshot(collection(db, 'coupons'), (snap) => {
    const list: Coupon[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Coupon);
    });
    callback(list);
  });
}

// Listen to settings
export function listenSettings(callback: (settings: StoreSettings) => void) {
  return onSnapshot(doc(db, 'settings', 'store-config'), (snap) => {
    if (snap.exists()) {
      callback(snap.data() as StoreSettings);
    } else {
      callback(DEFAULT_STORE_SETTINGS);
    }
  });
}

// Listen to user reviews for a product or globally
export function listenReviews(productId: string | null, callback: (reviews: Review[]) => void) {
  const colRef = collection(db, 'reviews');
  const q = productId ? query(colRef, where('productId', '==', productId)) : colRef;
  return onSnapshot(q, (snap) => {
    const list: Review[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Review);
    });
    callback(list);
  });
}

// Add a review
export async function addReview(review: Omit<Review, 'id' | 'createdAt'>) {
  const newReview = {
    ...review,
    createdAt: new Date().toISOString()
  };
  await addDoc(collection(db, 'reviews'), newReview);
}

// Delete a review
export async function deleteReview(id: string) {
  await deleteDoc(doc(db, 'reviews', id));
}

// Listen to user cart
export function listenCart(userId: string, callback: (cart: { product: Product; quantity: number }[]) => void) {
  return onSnapshot(collection(db, 'users', userId, 'cart'), (snap) => {
    const list: { product: Product; quantity: number }[] = [];
    snap.forEach((doc) => {
      list.push(doc.data() as { product: Product; quantity: number });
    });
    callback(list);
  });
}

// Sync cart helper
export async function updateCartItemInFirebase(userId: string, product: Product, quantity: number) {
  const itemRef = doc(db, 'users', userId, 'cart', product.id);
  if (quantity <= 0) {
    await deleteDoc(itemRef);
  } else {
    await setDoc(itemRef, { product, quantity });
  }
}

// Clear cart
export async function clearCartInFirebase(userId: string) {
  const q = query(collection(db, 'users', userId, 'cart'));
  const snap = await getDocs(q);
  for (const itemDoc of snap.docs) {
    await deleteDoc(doc(db, 'users', userId, 'cart', itemDoc.id));
  }
}

// Listen to wishlist (doc representation)
export function listenWishlist(userId: string, callback: (wishlistIds: string[]) => void) {
  return onSnapshot(doc(db, 'users', userId, 'wishlist', 'items'), (snap) => {
    if (snap.exists()) {
      callback(snap.data().ids || []);
    } else {
      callback([]);
    }
  });
}

// Toggle wishlist
export async function toggleWishlistInFirebase(userId: string, productId: string, currentIds: string[]) {
  const ref = doc(db, 'users', userId, 'wishlist', 'items');
  let updatedIds: string[];
  if (currentIds.includes(productId)) {
    updatedIds = currentIds.filter(id => id !== productId);
  } else {
    updatedIds = [...currentIds, productId];
  }
  await setDoc(ref, { ids: updatedIds });
}

// Listen to addresses
export function listenAddresses(userId: string, callback: (addresses: Address[]) => void) {
  return onSnapshot(collection(db, 'users', userId, 'addresses'), (snap) => {
    const list: Address[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Address);
    });
    callback(list);
  });
}

// Address Book Operations
export async function saveAddressInFirebase(userId: string, address: Omit<Address, 'id'> & { id?: string }) {
  const id = address.id || 'addr-' + Math.floor(100 + Math.random() * 900);
  const addrRef = doc(db, 'users', userId, 'addresses', id);
  await setDoc(addrRef, { ...address, id });
}

export async function deleteAddressFromFirebase(userId: string, addressId: string) {
  await deleteDoc(doc(db, 'users', userId, 'addresses', addressId));
}

// Listen to user-specific notifications
export function listenNotifications(userId: string, callback: (notifications: Notification[]) => void) {
  return onSnapshot(collection(db, 'users', userId, 'notifications'), (snap) => {
    const list: Notification[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Notification);
    });
    callback(list);
  });
}

// Mark notification as read
export async function markNotificationReadInFirebase(userId: string, notificationId: string) {
  const ref = doc(db, 'users', userId, 'notifications', notificationId);
  await updateDoc(ref, { isRead: true });
}

// Broadcast Notification
export async function broadcastNotificationInFirebase(title: string, message: string) {
  const usersSnap = await getDocs(collection(db, 'users'));
  const newNotification = {
    title,
    message,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    isRead: false
  };
  
  // Save notification to users
  for (const userDoc of usersSnap.docs) {
    const notifId = 'notif-' + Math.floor(100 + Math.random() * 900);
    await setDoc(doc(db, 'users', userDoc.id, 'notifications', notifId), {
      ...newNotification,
      id: notifId
    });
  }
}

// Listen to orders
export function listenOrders(userId: string | null, callback: (orders: Order[]) => void) {
  const colRef = collection(db, 'orders');
  // If user is admin, they can see all orders.
  const q = userId ? query(colRef, where('userId', '==', userId)) : colRef;
  return onSnapshot(q, (snap) => {
    const list: Order[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Order);
    });
    // Sort by date descending
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  });
}

// Create new order
export async function placeOrderInFirebase(order: Omit<Order, 'id'>) {
  const id = 'ord-' + Math.floor(1000 + Math.random() * 9000);
  const orderRef = doc(db, 'orders', id);
  const fullOrder = {
    ...order,
    id
  };
  await setDoc(orderRef, fullOrder);
  return fullOrder;
}

// Update order status
export async function updateOrderStatusInFirebase(orderId: string, status: any, trackingSteps: any[]) {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    status,
    trackingSteps
  });
}

// -----------------------------------------------------------------
// CATALOG & SETTINGS COCKPIT MANAGEMENT (ADMIN)
// -----------------------------------------------------------------

// Products management
export async function addProductInFirebase(product: Product) {
  await setDoc(doc(db, 'products', product.id), product);
}

export async function updateProductInFirebase(product: Product) {
  await setDoc(doc(db, 'products', product.id), product);
}

export async function deleteProductFromFirebase(id: string) {
  await deleteDoc(doc(db, 'products', id));
}

// Categories Management
export async function saveCategoryInFirebase(cat: Category) {
  await setDoc(doc(db, 'categories', cat.id), cat);
}

export async function deleteCategoryFromFirebase(id: string) {
  await deleteDoc(doc(db, 'categories', id));
}

// Brands Management
export async function saveBrandInFirebase(brand: Brand) {
  await setDoc(doc(db, 'brands', brand.id), brand);
}

export async function deleteBrandFromFirebase(id: string) {
  await deleteDoc(doc(db, 'brands', id));
}

// Coupon management
export async function saveCouponInFirebase(coupon: Coupon) {
  await setDoc(doc(db, 'coupons', coupon.id), coupon);
}

export async function deleteCouponFromFirebase(id: string) {
  await deleteDoc(doc(db, 'coupons', id));
}

// Offer Management
export async function saveOfferInFirebase(offer: Offer) {
  await setDoc(doc(db, 'offers', offer.id), offer);
}

export async function deleteOfferFromFirebase(id: string) {
  await deleteDoc(doc(db, 'offers', id));
}

// Settings management
export async function saveSettingsInFirebase(settings: StoreSettings) {
  await setDoc(doc(db, 'settings', 'store-config'), settings);
}

// Supplier Management
export async function saveSupplierInFirebase(supplier: Supplier) {
  await setDoc(doc(db, 'suppliers', supplier.id), supplier);
}

export async function deleteSupplierFromFirebase(id: string) {
  await deleteDoc(doc(db, 'suppliers', id));
}

// Listen to suppliers
export function listenSuppliers(callback: (suppliers: Supplier[]) => void) {
  return onSnapshot(collection(db, 'suppliers'), (snap) => {
    const list: Supplier[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Supplier);
    });
    callback(list);
  });
}

// Listen to users (for Admin dashboard user management)
export function listenUsers(callback: (users: User[]) => void) {
  return onSnapshot(collection(db, 'users'), (snap) => {
    const list: User[] = [];
    snap.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as User);
    });
    callback(list);
  });
}

// Update user role
export async function updateUserRoleInFirebase(userId: string, role: 'customer' | 'admin' | 'delivery') {
  await updateDoc(doc(db, 'users', userId), { role });
}
