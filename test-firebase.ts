import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    // Test the characters query also
    try {
      const q = query(collection(db, 'characters'), where('creatorId', '==', 'test_id'), where('isPublic', '==', true));
      const qSnap = await getDocs(q);
      console.log('Success characters!', qSnap.size);
    } catch(e: any) {
      console.error('Failed characters!', e.message);
    }

    try {
      const docRef = doc(db, 'dummy_test', 'test_id');
      const docSnap = await getDoc(docRef);
      console.log('Success dummy_test!', docSnap.exists());
    } catch (e: any) {
      console.error('Failed dummy_test!', e.message);
    }

    try {
      const docRef = doc(db, 'public_profiles', 'test_id');
      const docSnap = await getDoc(docRef);
      console.log('Success profile!', docSnap.exists());
    } catch (e: any) {
      console.error('Failed profile!', e.message);
    }

    process.exit(0);
  } catch (e: any) {
    console.error('Failed profile!', e.message);
    process.exit(1);
  }
}

test();
