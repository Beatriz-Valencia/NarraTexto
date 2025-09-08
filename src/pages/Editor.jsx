import { useNavigate } from 'react-router-dom';
import { useSession } from '../state/SessionContext.jsx';

import FormField from '../components/ui/FormField';
import AppInput from '../components/ui/AppInput';
import AppTextArea from '../components/ui/AppTextArea';
import AppButton from '../components/ui/AppButton';

export default function Editor() {
  const navigate = useNavigate();
  const { text, setText, query, setQuery } = useSession();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',    // <-- centrado total
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 900, display: 'grid', gap: 20 }}>
        <h2 style={{ margin: 0, color: '#fff' }}>Escribe aquí tu texto</h2>

        <FormField label="Texto a narrar">
          <AppTextArea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pega aquí tu texto…"
          />
        </FormField>

        <FormField
          label="Categoría / Tema de imágenes"
        >
          <AppInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe el tema para buscar imágenes"
          />
        </FormField>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <AppButton
            type="primary"
            size="large"
            onClick={() => navigate('/player')}
          >
            Convertir mi texto en contenido visual
          </AppButton>
        </div>
      </div>
    </div>
  );
}