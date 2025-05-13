// Chat.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase"; // Make sure the path to firebase is correct
import { doc, getDoc } from "firebase/firestore";

const Chat = () => {
  const { id } = useParams(); // Get the user ID from the URL parameter
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "users", id); // Access user data from Firestore by ID
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data()); // Store user data in the state
        } else {
          console.log("No such user!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [id]); // Effect runs whenever the `id` changes

  return (
    <div className="chat-container">
      {userData ? (
        <div>
          <h1>Chat with {userData.name}</h1>
          {/* You can later implement the chat functionality here */}
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default Chat;
