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
    logId: '6657285700348815c3aa',
    storageId: '66224b663e8b41c3e457'
}

const client = new Client();
client.setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const storage = new Storage(client);

export const sendPasswordResetEmail = async (email) => {
  try {
    // Send the reset link with userId and secret parameters
    await account.createRecovery(
      email,
      'https://reset-password.vercel.app/?userId={userId}&secret={secret}'  // Ensure proper params
    );
  } catch (error) {
    throw new Error(error.message);
  }
};
export const createUser = async (email, password, confirmPassword, account_number, phone) => {
  try {
    // Step 1: Check if passwords match
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    // Step 2: Check if the account number exists and if it's already activated
    const accountCheck = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [
        Query.equal('account_number', account_number)
      ]
    );

    if (accountCheck.documents.length === 0) {
      throw new Error("This account number is not registered with FLECO.");
    }

    const existingUser = accountCheck.documents[0];
    
    // Step 3: Check if the account number is already activated
    if (existingUser.activated) {
      throw new Error("This account number is already associated with an active account.");
    }

    // Step 4: Create an Appwrite account for the user
    const appwriteAccount = await account.create(
      ID.unique(),   // Generate a unique ID for the new account
      email,         // The email the user entered
      password       // The password the user entered
    );

    // Step 5: Update the existing user document to set `activated` to true and update other fields
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      existingUser.$id, // Use the existing document's ID
      {
        activated: true,      // Mark the account as activated
        email: email,         // Update the email in the database document
        password: password,   // Store the password (consider encrypting if needed)
        phone: phone,         // Update the phone number
        accountId: appwriteAccount.$id // Store Appwrite account ID
      }
    );

    return updatedUser;

  } catch (error) {
    console.log(error);
    throw new Error(error.message || "An error occurred during signup.");
  }
};


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
        additionalDetails: form.details,
        Location: form.Location,
        locationName: form.locationName,
        consumer_id:form.userName
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
    const allComplaints = [];
    let lastDocumentId = null;

    // Loop to fetch all complaints using pagination
    while (true) {
      // Prepare queries for pagination and filtering by user
      const queries = [
        Query.equal("consumers", userId),
        Query.orderDesc('$createdAt'),
        Query.limit(25) // Fetch 25 documents at a time (you can change this limit)
      ];

      if (lastDocumentId) {
        // If there is a last document, use cursor for pagination
        queries.push(Query.cursorAfter(lastDocumentId));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.complaintsCollectionId,
        queries
      );

      // Append fetched complaints to the overall list
      allComplaints.push(...response.documents);

      // If fewer than 25 documents were returned, break the loop (no more data)
      if (response.documents.length < 25) {
        break;
      }

      // Update lastDocumentId for the next iteration
      lastDocumentId = response.documents[response.documents.length - 1].$id;
    }

    return allComplaints;
  } catch (error) {
    throw new Error(`Failed to retrieve complaints: ${error.message}`);
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
//get all complaints
export async function getAllComplaints() {
  try {
    const allComplaints = [];
    let lastDocumentId = null;

    // Loop to fetch all complaints using pagination
    while (true) {
      // Prepare queries for pagination
      const queries = [
        Query.limit(25) // Fetch 25 documents at a time (you can change this limit)
      ];

      if (lastDocumentId) {
        // If there is a last document, use cursor for pagination
        queries.push(Query.cursorAfter(lastDocumentId));
      }

      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.complaintsCollectionId,
        queries
      );

      // Append fetched complaints to the overall list
      allComplaints.push(...response.documents);

      // If fewer than 25 documents were returned, break the loop (no more data)
      if (response.documents.length < 25) {
        break;
      }

      // Update lastDocumentId for the next iteration
      lastDocumentId = response.documents[response.documents.length - 1].$id;
    }

    return allComplaints;
  } catch (error) {
    throw new Error(`Failed to retrieve complaints: ${error.message}`);
  }
}



export const updatePassword = async (newPassword, currentPassword) => {
  return account.updatePassword(newPassword, currentPassword); 
};

export const updateEmail = async (newEmail, password) => {
  return account.updateEmail(
 newEmail, password
  );
};


export const createLog = async (consumer_id, name, time_stamp, action, email, role) =>{
  try {


    const newLog = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.logId,
      ID.unique(),
      {
        consumer_id: consumer_id,
        consumer_name: name,
        time_stamp: time_stamp,
        Action: action,
        email: email,
        role: role
      }
    );
  
    return newLog;
  
  } catch (error){
    console.log(error);
    throw new Error(error)
  } {
    
  }
  }

  //followUp update
  export const updateComplaintStatus = async (complaintId,  followUp, followedUpAt) => {
    try {
      const complaintStatus = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.complaintsCollectionId,
        complaintId,
        {followUp, followedUpAt}
   
      );
    
  
      return complaintStatus;
    } catch (error) {
      throw new Error(error);
    }
  };

  //withdraw 
  export const updateComplaintStatusToWithdrawn = async (complaintId,  status, reason, withdrawnAt) => {
    try {
      const complaintStatus = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.complaintsCollectionId,
        complaintId,
        {status, reason, withdrawnAt}
   
      );
    
  
      return complaintStatus;
    } catch (error) {
      throw new Error(error);
    }
  };