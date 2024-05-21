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
    complaintsCollectionId:'6626029b134a98006f77',
    storageId: '66224b663e8b41c3e457'
}

const client = new Client();
client.setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const storage = new Storage(client);


export const createUser = async (name, email, password, account_number, phone) =>{
try {
  const newAccount = await account.create(
    ID.unique(),
    email,
    password,
    account_number,
    phone,
  )
  if(!newAccount) throw Error;

  await signIn(email, password)
  const newUser = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    ID.unique(),
    {
      name: name,
      email: email,
      account_number: account_number,
      password: password,
      phone: phone,
      accountId: newAccount.$id
    }
  );

  return newUser;

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

//logout
export async function signOut() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
}



export const uploadFile = async(file, type) =>{
  if(!file) return;

const {mimeType, ...rest} = file
  const asset = { type: mimeType, ...rest
  };

  console.log('FILE', file)
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      asset
    );
    console.log('UPLOADED', uploadedFile)

    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl
  } catch (error) {
    throw new Error(error)
  }
}

// Get File Preview
export const getFilePreview = async (fileId, type) =>{
  let fileUrl;
  try {
    if (type === "video") {
      fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        appwriteConfig.storageId,
        fileId,
        2000,
        2000,
        "top",
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
}

export const createComplaint = async (form) =>{
  try {
    const [imageUrl] = await Promise.all([
      uploadFile(form.thumbnail, 'image')
    ])
  
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.complaintsCollectionId,
      ID.unique(),
      {
        description: form.description,
        city: form.city,
        barangay: form.barangay,
        image: imageUrl,
        consumers: form.userName,
        createdAt: form.createdAt,
        consumer_name: form.consumerName,
        street: form.street,
        additionalDetails: form.details
      }
    
     
    )
    console.log("User ID:", form.userName);
    
    return newPost;
  } catch (error) {
    throw new Error(error)
  }
}

export async function getUserComplaints(userId) {
  try {
    const complaints = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.complaintsCollectionId,
      [Query.equal("consumers", userId), Query.orderDesc('$createdAt')]
    );

    return complaints.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export const updateUserProfile = async (userId, { phone, password, email }) => {
  try {
    const user = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      {
        phone,
        password,
        email
      }
    );
  

    return user;
  } catch (error) {
    throw new Error(error);
  }
};
export const updatePassword = async (newPassword, currentPassword) => {
  return account.updatePassword(newPassword, currentPassword); 
};

export const updateEmail = async (newEmail, password) => {
  return account.updateEmail(
 newEmail, password
  );
};