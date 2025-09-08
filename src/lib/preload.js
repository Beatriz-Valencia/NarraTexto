export async function preloadImages(list) {
  await Promise.all(
    list.map(item => new Promise(resolve => {
      const img = new Image();
      img.onload = img.onerror = () => resolve();
      img.src = item.url;
    }))
  );
}