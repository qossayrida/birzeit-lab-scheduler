import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Contact from './components/Contact';
import Footer from './components/Footer';
import './i18n';

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <Navbar />
        <main>

        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default App;
