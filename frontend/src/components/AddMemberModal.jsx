import * as React from "react";
import { Box, Button, Modal } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddMemberPage from "../pages/AddMember/AddMemberPage";

//NEED TESTING..
// DONE: Implement handleSave function to save member data to database
// DONE: Make sure that the correct information is sent to the correct database (WICS or COM)
// DONE: display success message
// DONE: display error message if member already exists
// OPTIONAL TODO: display member details modal if member already exists

export default function AddMemberModal() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [memberData, setMemberData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    orgId: "", 
  });

  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setMemberData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle saving member data
  const handleSave = async () => {
    console.log("Adding new member with info:", memberData);

    // Validate required fields
    if (
      !memberData.firstName ||
      !memberData.lastName ||
      !memberData.email ||
      !memberData.orgId
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    const apiEndpoint =
      memberData.orgId === 1 ? "/api/wics/members" : "/api/com/members";

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        if (response.status === 409) {
          setErrorMessage("Member already exists.");
          return;
        }
        throw new Error("Failed to save member data");
      }

      const result = await response.json();
      console.log("Member added successfully:", result);
      setSuccessMessage("Member added successfully!");

      // Close modal and reset form
      setTimeout(() => {
        handleClose();
        setMemberData({ firstName: "", lastName: "", email: "", orgId: "" });
        setSuccessMessage("");
      }, 1500);
    } catch (error) {
      console.error("Error saving member:", error);
      setErrorMessage("Failed to add member. Please try again.");
    }
  };

  return (
    <>
      <Button onClick={handleOpen} variant="contained" startIcon={<AddIcon />}>
        Add Member
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box>
          <AddMemberPage
            memberData={memberData}
            handleChange={handleChange}
            handleSave={handleSave}
          />
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </Box>
      </Modal>
    </>
  );
}
