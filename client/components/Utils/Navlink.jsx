import { useRouter } from 'next/router';
import Link from 'next/link';

function NavLink({ to, exact, children, activeClassName, ...props }) {
  const { pathname } = useRouter();
  const isActive = exact ? pathname === to : pathname.startsWith(to);

  if (isActive) {
    props.className = props.className
      ? `${props.className} ${activeClassName}`
      : activeClassName;
  }

  return (
    <Link href={to}>
      <a {...props}>{children}</a>
    </Link>
  );
}

export default NavLink;
