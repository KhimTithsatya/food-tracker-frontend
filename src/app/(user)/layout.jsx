export default function UserLayout({ children }) {
  return (
    <div>
      <header>User Navbar</header>
      <main>{children}</main>
    </div>
  );
}