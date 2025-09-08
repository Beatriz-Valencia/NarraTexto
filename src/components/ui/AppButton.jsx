import { Button } from 'antd';

const AppButton = ({ children, onClick, ...props }) => {
  const handleClick = (e) => {
    if (import.meta.env.DEV) {
      console.log('[AppButton] click', { props }); // se ve al pulsar
    }
    onClick?.(e);
  };

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  );
};

export default AppButton;