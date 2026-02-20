export default function ProfileSection({ title, children, spacing = 'normal' }) {
  const spacingClass = spacing === 'large' ? 'mt-6' : '';
  
  return (
    <div className={spacingClass}>
      <p className="subheading">{title}</p>
      {children}
    </div>
  );
}
