import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import VoiceReader from './pages/VoiceReader';
import './styles/base.css';
import 'antd/dist/reset.css';

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#A3FF12',         // lima
          colorLink: '#A3FF12',
          borderRadius: 12,
          fontSize: 14,
          colorText: '#0B0B0C',            // texto en componentes (paneles blancos)
          colorBgContainer: '#FFFFFF',
        },
        components: {
          Button: { controlHeight: 40, fontWeight: 600 },
          Input: { controlHeight: 40 },
          Select: { controlHeight: 40 },
          Slider: { colorPrimaryBorder: '#A3FF12' },
        }
      }}
    >
      <BrowserRouter>
        <nav className="site-nav">
          <Link className="brand" to="/">Audiotexto Visual</Link>
        </nav>
        <Routes>
          <Route path="/" element={<VoiceReader />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}