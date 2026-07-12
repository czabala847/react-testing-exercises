import { Link, Route, Routes } from "react-router";
import { routes } from "./routes/routes";
import "./App.css";

const Home = () => (
  <section id="center">
    <h1>Ejercicios de React</h1>
    <ul>
      {routes.map(({ path, label }) => (
        <li key={path}>
          <Link to={path}>{label}</Link>
        </li>
      ))}
    </ul>
  </section>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {routes.map(({ path, Component }) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
    </Routes>
  );
}

export default App;
