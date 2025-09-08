import { useNavigate } from 'react-router-dom';
import AppButton from '../components/ui/AppButton';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      flexDirection:'column', gap:16, textAlign:'center', padding:24
    }}>
      <h1 style={{ fontSize:28, margin:0 }}>Haz click aquí para dar vida a tu texto</h1>
      <AppButton type="primary" size="large" onClick={() => navigate('/editor')}>
        Empezar
      </AppButton>
    </div>
  );
}