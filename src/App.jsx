import { FilterProvider } from './context/FilterContext';
import NavBar from './components/NavBar';
import SectionWrapper from './components/SectionWrapper';
import ErrorBoundary from './components/ErrorBoundary';
import { sectionConfig } from './config/sections';

export default function App() {
  return (
    <FilterProvider>
      <div className="bg-krem text-teks font-sans min-h-screen selection:bg-hijau-muda">
        <NavBar />
        <main>
          {sectionConfig.map((config) => {
            const Component = config.component;
            return (
              <ErrorBoundary key={config.id}>
                <SectionWrapper
                  id={config.id}
                  title={config.title}
                  subtitle={config.subtitle}
                  bridgeText={config.bridgeText}
                >
                  <Component />
                </SectionWrapper>
              </ErrorBoundary>
            );
          })}
        </main>
      </div>
    </FilterProvider>
  );
}