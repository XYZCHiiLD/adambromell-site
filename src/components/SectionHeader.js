import { typography } from '@/styles/theme';

export default function SectionHeader({ children }) {
  return (
    <h2 
      className="font-bold mb-4"
      style={{ fontSize: typography.sizes.h2 }}
    >
      {children}
    </h2>
  );
}
