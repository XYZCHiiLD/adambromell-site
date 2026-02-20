export default function ExternalLink({ href, children, bold = false }) {
  return (
    <a 
      href={href}
      target="_blank" 
      rel="noopener noreferrer"
      className={`text-ribbon-red hover:underline ${bold ? 'font-bold' : ''}`}
    >
      {children}
    </a>
  );
}
