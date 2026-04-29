
import { MongoClient } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Please define MONGODB_URI in .env.local");
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }

  return global._mongoClientPromise;
}

const clientPromise = {
  then: (...args: Parameters<Promise<MongoClient>["then"]>) =>
    getClientPromise().then(...args),
  catch: (...args: Parameters<Promise<MongoClient>["catch"]>) =>
    getClientPromise().catch(...args),
  finally: (...args: Parameters<Promise<MongoClient>["finally"]>) =>
    getClientPromise().finally(...args),
  [Symbol.toStringTag]: "Promise",
} as Promise<MongoClient>;

export default clientPromise;
