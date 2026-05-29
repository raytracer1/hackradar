interface CardProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
}

export default function Card({ children, className = '', href }: CardProps) {
  const classes = `block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md ${className}`;

  if (href) {
    return <a href={href} className={classes}>{children}</a>;
  }

  return <div className={classes}>{children}</div>;
}
