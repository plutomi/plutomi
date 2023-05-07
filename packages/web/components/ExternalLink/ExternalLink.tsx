type ExternalLinkProps = {
  href: `https://${string}`;
  children: React.ReactNode;
};

export const ExternalLink = ({ children, href }: ExternalLinkProps) => (
  <a href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
);
