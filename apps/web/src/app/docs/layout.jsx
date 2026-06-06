import { RootProvider } from 'fumadocs-ui/provider/next';
import 'fumadocs-ui/style.css';

export default function DocsRootLayout({ children }) {
  return (
    <RootProvider>
      {children}
    </RootProvider>
  );
}
