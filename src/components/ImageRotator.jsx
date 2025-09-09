import styles from '../styles/voice.module.css';

export default function ImageRotator({ images, index, ready }) {
    // Si aún no hay imágenes listas, muestra un placeholder 
  if (!images?.length) {
    return <div className={`${styles.imageShell} panel`}>Sin imágenes. Busca un tema o pulsa Reproducir.</div>;
  }
  const img = images[index] || images[0];

  return (
    <div className={`${styles.imageShell} panel`}>
      {!ready && <div className={styles.skeleton} />}
      {ready && (
        <>
          <img key={index} className={styles.image} src={img.url} alt="" />
          <a
            className={styles.credit}
            href={img.unsplashLink}
            target="_blank" rel="noreferrer"
            title={`Photo by ${img.authorName} on Unsplash`}
          >
            Photo by {img.authorName} on Unsplash
          </a>
        </>
      )}
    </div>
  );
}
