import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const app = initializeApp({
  projectId: "gen-lang-client-0788845722",
});

const oldDb = getFirestore(app, "ai-studio-230da23f-4d80-4e41-9a25-4e023bda6264");
const newDb = getFirestore(app, "gimsai");

async function copyCollection(collectionName: string) {
  console.log(`Copying collection: ${collectionName}`);
  const snapshot = await oldDb.collection(collectionName).get();
  console.log(`Found ${snapshot.size} documents in ${collectionName}`);
  
  let count = 0;
  const batchSize = 400;
  let batch = newDb.batch();

  for (const doc of snapshot.docs) {
    const newRef = newDb.collection(collectionName).doc(doc.id);
    batch.set(newRef, doc.data());
    count++;

    if (count % batchSize === 0) {
      await batch.commit();
      console.log(`Committed ${count} documents for ${collectionName}`);
      batch = newDb.batch();
    }
  }

  if (count % batchSize !== 0) {
    await batch.commit();
    console.log(`Committed remaining ${count % batchSize} documents for ${collectionName}`);
  }
  console.log(`Finished copying ${collectionName}. Total: ${count}`);
}

async function runMigration() {
  const collections = [
    'users', 
    'characters', 
    'chats', 
    'notifications', 
    'centralMemories', 
    'conversationContext'
  ];
  
  for (const col of collections) {
    try {
      await copyCollection(col);
    } catch (e) {
      console.error(`Error copying ${col}:`, e);
    }
  }
  console.log("Migration complete!");
  process.exit(0);
}

runMigration();
