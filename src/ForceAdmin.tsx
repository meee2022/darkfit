import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import toast from "react-hot-toast";

export default function ForceAdmin() {
  const makeMeAdmin = useMutation(api.profiles.devMakeMeAdmin);

  const handleMakeMeAdmin = async () => {
    try {
      const result = await makeMeAdmin({});
      toast.success(result.message || "✅ أصبحت Admin الآن!");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (e: any) {
      toast.error(e.message || "فشلت العملية");
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: 9999,
      background: "#59f20d",
      padding: "15px 25px",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(89,242,13,0.4)"
    }}>
      <button
        onClick={handleMakeMeAdmin}
        style={{
          background: "#0a0d08",
          color: "#59f20d",
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        👑 اجعلني Admin
      </button>
    </div>
  );
}
