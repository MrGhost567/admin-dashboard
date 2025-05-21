const AccessDenied = () => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f8f8",
        flexDirection: "column",
        color: "#333",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "10px", color: "#d9534f" }}>
        403 - Access Denied
      </h1>
      <p style={{ fontSize: "1.2rem" }}>
        Sorry, you don't have permission to view this page.
      </p>
    </div>
  );
};

export default AccessDenied;
