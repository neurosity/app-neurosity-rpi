import React, { useEffect } from "react";
import { Router, navigate } from "@reach/router";

import { ProvideNotion } from "./services/notion";
import { Devices } from "./pages/Devices";
import { Loading } from "./components/Loading";
import { Login } from "./pages/Login";
import { Logout } from "./pages/Logout";
import { Tests } from "./pages/Tests/Tests";

import { useNotion } from "./services/notion";

export function App() {
  return (
    <ProvideNotion>
      <Routes />
    </ProvideNotion>
  );
}

function Routes() {
  const { user, loadingUser } = useNotion();

  useEffect(() => {
    if (!loadingUser && !user) {
      navigate("/login");
    }
  }, [user, loadingUser]);

  if (loadingUser) {
    return <Loading />;
  }

  return (
    <Router>
      <Tests path="/" />
      <Devices path="/devices" />
      <Login path="/login" />
      <Logout path="/logout" />
    </Router>
  );
}
