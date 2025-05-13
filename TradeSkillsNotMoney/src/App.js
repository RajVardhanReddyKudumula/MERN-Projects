import React, { useState, useEffect } from "react";
import { auth, provider, db, storage } from "./firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth"; // Import signOut
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, query, where, getDocs } from "firebase/firestore"; // Add this import
import Chat from "./Chat";
import "./App.css";
import { useNavigate } from "react-router-dom";

const App = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [searchSkill, setSearchSkill] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [newSkill, setNewSkill] = useState(""); // Added new skill state
  const [age, setAge] = useState("");
  const [ageDoc, setAgeDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Trade Skills, Not Money";
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      await fetchUserData(result.user.uid);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign the user out
      setUser(null); // Reset the user state
      setUserData(null); // Reset user data state
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const searchUsersBySkill = async () => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("skills", "array-contains", searchSkill));
      const querySnapshot = await getDocs(q);

      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users by skill:", error);
    }
  };

  const fetchUserData = async (uid) => {
    try {
      setLoading(true);
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data());
      } else {
        await setDoc(userRef, { skills: [], age: null, ageVerified: false });
        setUserData({ skills: [], age: null, ageVerified: false });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadAgeVerification = async () => {
    if (!ageDoc) {
      alert("Please select a file to upload.");
      return;
    }

    try {
      const fileRef = ref(storage, `ageDocs/${user.uid}/${ageDoc.name}`); // Use the file name to prevent overwriting

      // Upload the file to Firebase storage
      await uploadBytes(fileRef, ageDoc);

      // Get the download URL of the uploaded file
      const fileURL = await getDownloadURL(fileRef);

      // Update Firestore with age, ageDoc URL, and ageVerified as false
      await updateDoc(doc(db, "users", user.uid), {
        age,
        ageDoc: fileURL,
        ageVerified: false,
      });

      alert("Age verification document uploaded successfully!");
      fetchUserData(user.uid); // Re-fetch user data to update the UI
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Error uploading document. Please try again.");
    }
  };

  const removeSkill = async (skill) => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        skills: arrayRemove(skill),
      });
      fetchUserData(user.uid); // Re-fetch user data after skill removal
    } catch (error) {
      console.error("Error removing skill:", error);
    }
  };

  const addSkill = async () => {
    if (!newSkill.trim()) return; // Prevent adding empty skills
    try {
      await updateDoc(doc(db, "users", user.uid), {
        skills: arrayUnion(newSkill),
      });
      setNewSkill(""); // Reset the input field after adding the skill
      fetchUserData(user.uid); // Re-fetch user data after adding skill
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  return (
    <div className="container">
      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <div className="dashboard">
          <h1>Welcome, {userData?.name || user.displayName}!</h1>
          <p>Email: {userData?.email || user.email}</p>
          <p>
            Age: {userData?.age || "Not specified"} (
            {userData?.ageVerified ? "Verified" : "Unverified"} )
          </p>

          <input
            type="number"
            placeholder="Enter age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <input type="file" onChange={(e) => setAgeDoc(e.target.files[0])} />
          <button onClick={uploadAgeVerification}>Upload Document</button>

          <h2>Your Skills</h2>
          <ul>
            {userData?.skills?.map((skill, index) => (
              <li key={index}>
                {skill}{" "}
                <button onClick={() => removeSkill(skill)}>Remove</button>
              </li>
            ))}
          </ul>

          {/* Add Skill Section */}
          <h2>Add a New Skill</h2>
          <input
            type="text"
            placeholder="Enter new skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
          />
          <button onClick={addSkill} disabled={!newSkill.trim()}>
            Add Skill
          </button>

          <h2>Search Users by Skill</h2>
          <input
            type="text"
            placeholder="Enter a skill..."
            value={searchSkill}
            onChange={(e) => setSearchSkill(e.target.value)}
          />
          <button onClick={searchUsersBySkill} disabled={!searchSkill.trim()}>
            Search
          </button>
          <ul>
            {searchResults.map((user) => (
              <li key={user.id} onClick={() => navigate(`/chat/${user.id}`)}>
                {user.name || "User"} (Skills: {user.skills.join(", ")} )
              </li>
            ))}
          </ul>

          {/* Logout Button */}
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleGoogleLogin}>Login with Google</button>
      )}
    </div>
  );
};

export default App;
