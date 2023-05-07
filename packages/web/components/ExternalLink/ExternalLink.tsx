type ExternalLinkProps = {
  href: `https://${string}`;
  children: React.ReactNode;
};

export const ExternalLink: React.FC<ExternalLinkProps> = ({
  children,
  href
}) => (
  <a href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
);
