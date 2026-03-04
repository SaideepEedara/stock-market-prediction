import React from "react";

const UserProfile = () => {
  const token = localStorage.getItem("token");

  let user = {};

  if (token) {
    try {
      user = JSON.parse(atob(token.split(".")[1]));
    } catch {}
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>User Profile</h2>

        <table style={styles.table}>
          <tbody>
            <tr>
              <td>Name</td>
              <td>{user.name || "N/A"}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>{user.email || "N/A"}</td>
            </tr>
            <tr>
              <td>User ID</td>
              <td>{user.id || "N/A"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserProfile;

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "white",
    padding: 40,
    borderRadius: 12,
    width: 500,
  },
  table: {
    width: "100%",
    marginTop: 20,
    borderCollapse: "collapse",
  },
};