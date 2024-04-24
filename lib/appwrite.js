import {
    Account,
    Avatars,
    Client,
    Databases,
    ID,
    Query,
    Storage,
  } from "react-native-appwrite";

export const appwriteConfig={
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.fleco.crew',
    projectId: '662248657f5bd3dd103c',
    databaseId: '66224a152d9f9a67af78',
    userCollectionId: '662601d0b9e605665bb4',
    storageId: '66224b663e8b41c3e457'
}

const client = new Client();
client.setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);
const account = new Account(client);

export const createUser = async (email, password, name, account_number) =>{
try {
  const newAccount = await account.create(
    ID.unique(),
    email,
    password,
    name,
    account_number
  )
  if(!newAccount) throw Error;

  await signIn()
} catch (error){
  console.log(error);
  throw new Error(error)
} {
  
}
}
const databases = new Databases(client);
  export const signIn = async(email, password) =>{
    try{
        const session = await account.createEmailSession(email, password);
        return session

    }catch(error)
    {
        throw new Error(error)
    }
  }
  //get current accoount
  export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}