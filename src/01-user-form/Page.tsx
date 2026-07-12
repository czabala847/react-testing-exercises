import { useState } from "react"
import { UserForm } from "./components/UserForm"
import { UserList } from "./components/UserList"
import type { User } from "./models/User"

export const UserFormPage = () => {
  const [users, setUsers] = useState<User[]>([]);

  const onUserAdd = (user: User) => {
    setUsers([...users, user]);
  };

  return (
    <div>
      <UserForm onUserAdd={onUserAdd} />
      <hr />
      <UserList users={users} />
    </div>
  );
};
