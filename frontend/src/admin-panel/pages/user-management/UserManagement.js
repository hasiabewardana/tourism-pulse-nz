import { Container } from "@mui/material";
import UserList from "../../components/user-management/UserList";
import classes from "./UserManagement.module.css"; // Import CSS module

function UserManagement() {
  return (
    <Container maxWidth="lg" className={classes.container}>
      <UserList />
    </Container>
  );
}

export default UserManagement;
