import { MongoClient, type Db } from "mongodb"

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!process.env.MONGODB_URI || process.env.MONGODB_URI === "disabled") {
  console.log("MongoDB está desabilitado para este ambiente")
  // Criar um promise que sempre falha para MongoDB desabilitado
  clientPromise = Promise.reject(new Error("MongoDB está desabilitado"))
} else {
  const uri = process.env.MONGODB_URI
  const options = {}

  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

export async function getDatabase(): Promise<Db> {
  if (process.env.MONGODB_URI === "disabled") {
    throw new Error("MongoDB está desabilitado")
  }
  const client = await clientPromise
  return client.db("zaphost")
}

export default clientPromise
