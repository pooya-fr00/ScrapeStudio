import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import { LocaleLayout } from './app/LocaleLayout';
import { readPreferredLocale } from './app/locale';
import { localizedPath } from './app/routes';
import { ThemeProvider } from './app/theme-provider';
import { LandingPage } from './pages/LandingPage';
import { NotFoundPage } from './pages/NotFoundPage';

const WorkspacePage = lazy(() =>
  import('./pages/WorkspacePage').then((module) => ({ default: module.WorkspacePage })),
);
const RecipesPage = lazy(() =>
  import('./pages/RecipesPage').then((module) => ({ default: module.RecipesPage })),
);
const HistoryPage = lazy(() =>
  import('./pages/HistoryPage').then((module) => ({ default: module.HistoryPage })),
);
const FoundationPage = lazy(() =>
  import('./pages/FoundationPage').then((module) => ({ default: module.FoundationPage })),
);
const DocumentationPage = lazy(() =>
  import('./pages/DocumentationPage').then((module) => ({ default: module.DocumentationPage })),
);
const PublicDocumentPage = lazy(() =>
  import('./pages/DocumentationPage').then((module) => ({ default: module.PublicDocumentPage })),
);
const ToolGuidePage = lazy(() =>
  import('./pages/DocumentationPage').then((module) => ({ default: module.ToolGuidePage })),
);
const PlaygroundPage = lazy(() =>
  import('./pages/PlaygroundPage').then((module) => ({ default: module.PlaygroundPage })),
);
const PlaygroundDemoPage = lazy(() =>
  import('./pages/PlaygroundPage').then((module) => ({ default: module.PlaygroundDemoPage })),
);

function RootLocaleRedirect() {
  return <Navigate replace to={localizedPath(readPreferredLocale(), 'home')} />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<div aria-busy="true" className="route-loading" />}>
      <Routes>
        <Route element={<RootLocaleRedirect />} path="/" />
        <Route element={<LocaleLayout />} path="/:locale">
          <Route element={<LandingPage />} index />
          <Route element={<WorkspacePage />} path="scrape" />
          <Route element={<FoundationPage page="tools" />} path="tools" />
          <Route element={<ToolGuidePage slug="table-extractor" />} path="tools/table-extractor" />
          <Route element={<ToolGuidePage slug="link-extractor" />} path="tools/link-extractor" />
          <Route element={<ToolGuidePage slug="image-extractor" />} path="tools/image-extractor" />
          <Route
            element={<ToolGuidePage slug="metadata-extractor" />}
            path="tools/metadata-extractor"
          />
          <Route element={<ToolGuidePage slug="custom-selector" />} path="tools/custom-selector" />
          <Route element={<RecipesPage />} path="recipes" />
          <Route element={<HistoryPage />} path="history" />
          <Route element={<DocumentationPage />} path="docs" />
          <Route element={<PublicDocumentPage slug="methodology" />} path="methodology" />
          <Route element={<PublicDocumentPage slug="security" />} path="security" />
          <Route element={<PublicDocumentPage slug="limitations" />} path="limitations" />
          <Route element={<PublicDocumentPage slug="privacy" />} path="privacy" />
          <Route element={<PublicDocumentPage slug="responsible-use" />} path="responsible-use" />
          <Route element={<PublicDocumentPage slug="about" />} path="about" />
          <Route element={<PlaygroundPage />} path="playground" />
          <Route element={<PlaygroundDemoPage kind="products" />} path="playground/products" />
          <Route element={<PlaygroundDemoPage kind="table" />} path="playground/table" />
          <Route element={<PlaygroundDemoPage kind="article" />} path="playground/article" />
          <Route element={<NotFoundPage />} path="*" />
        </Route>
        <Route element={<Navigate replace to="/en" />} path="*" />
      </Routes>
    </Suspense>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
