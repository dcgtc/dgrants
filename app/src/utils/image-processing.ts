export interface Point {
  x: number;
  y: number;
}

export const findImageHeightBasedOnRatio = (container: HTMLDivElement, img: HTMLImageElement) => {
  return (img.height * container.offsetWidth) / img.width;
};

export const findImageWidthBasedOnRatio = (container: HTMLDivElement, img: HTMLImageElement) => {
  return (img.width * container.offsetHeight) / img.height;
};

export const findMoveMouseCursor = (container: HTMLElement) => (e: MouseEvent) => {
  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  return { x, y };
};

export const diffPoints = (p1: Point, p2: Point) => {
  return { x: p2.x - p1.x, y: p2.y - p1.y };
};

export const getRatioDirection = (image: HTMLImageElement, desiredRatio: number) => {
  const ratio = image.width / image.height;
  const ratioDirection = ratio > desiredRatio ? true : false;
  return ratioDirection;
};
