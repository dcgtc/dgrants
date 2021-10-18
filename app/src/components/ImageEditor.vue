<template>
  <div
    id="image-container"
    class="relative overflow-hidden border border-current"
    :style="`width: 640px; height: ${640 / desiredRatio}px`"
  >
    <img id="selected-image" :src="selectedImage" class="max-w-none absolute" />
  </div>
  <hr />
  <button type="button" @click="draw">Crop</button>
  <div id="canvas-container"></div>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';

export default defineComponent({
  name: 'ImageEditor',

  props: {
    selectedImage: {
      type: String,
      required: true,
    },
    desiredRatio: {
      type: Number,
      default: 16 / 9,
    },
  },

  setup(props) {
    watch(
      () => props.selectedImage,
      async () => {
        // TODO need to implement a more flexible ratio selection for the component
        // Currently it only works with 1920 x 1080 - 16 x 9
        interface Point {
          x: number;
          y: number;
        }

        var container = <HTMLDivElement>document.getElementById('image-container');
        var c = <HTMLImageElement>document.getElementById('selected-image');

        var image = new Image();
        image.src = props.selectedImage;

        var isGrabbing = false;
        var grabbinStartPoints = <null | Point>null;

        const getRatioDirection = (image: HTMLImageElement) => {
          const ratio = image.width / image.height;
          const ratioDirection = ratio > props.desiredRatio ? true : false;
          return ratioDirection;
        };

        const findImageHeightBasedOnRatio = (container: HTMLDivElement, img: HTMLImageElement) => {
          return (img.height * container.offsetWidth) / img.width;
        };
        const findImageWidthBasedOnRatio = (container: HTMLDivElement, img: HTMLImageElement) => {
          return (img.width * container.offsetHeight) / img.height;
        };

        image.onload = () => {
          const ratioDirection = getRatioDirection(image);

          // Initial Size of the image based on it's ratio it will fit by its width or height

          if (ratioDirection) {
            c.style.width = 'auto';
            c.style.height = `${container.offsetHeight}px`;
          } else {
            c.style.height = 'unset';
            c.width = container.offsetWidth;
          }

          if (ratioDirection) {
            const relativeWidth = findImageWidthBasedOnRatio(container, image);
            c.style.left = `${(container.offsetWidth - relativeWidth) / 2}px`;
          } else {
            const relativeHeight = findImageHeightBasedOnRatio(container, image);
            c.style.top = `${(container.offsetHeight - relativeHeight) / 2}px`;
          }
        };

        const findMoveMouseCursor = (container: HTMLElement) => (e: MouseEvent) => {
          const rect = container.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          return { x, y };
        };

        const diffPoints = (p1: Point, p2: Point) => {
          return { x: p2.x - p1.x, y: p2.y - p1.y };
        };

        const findMouseCursor = findMoveMouseCursor(container);

        c.addEventListener('mousedown', (e) => {
          e.preventDefault();
          isGrabbing = true;
          grabbinStartPoints = findMouseCursor(e);
        });

        c.addEventListener('mouseup', () => {
          if (isGrabbing) {
            isGrabbing = false;
            lastMovePoint = null;
            moveCounter = 0;
          }
        });

        var lastMovePoint = <null | Point>null;
        var moveCounter = 0;

        c.addEventListener('mousemove', (e) => {
          e.preventDefault();

          if (isGrabbing && grabbinStartPoints) {
            if (lastMovePoint) {
              const normalizeDiff = (point: Point) => {
                let x = point.x;
                let y = point.y;
                if (moveCounter > 5) return { x, y };
                if (point.x < -10) {
                  x = -10;
                } else if (point.x > 10) {
                  x = 10;
                }
                if (point.y < -10) {
                  y = -10;
                } else if (point.y > 10) {
                  y = 10;
                }
                return { x, y };
              };

              const currentDiff = normalizeDiff(diffPoints(findMouseCursor(e), lastMovePoint));
              const offsetRight = c.width - container.offsetWidth + c.offsetLeft;
              const offsetLeft = -1 * c.offsetLeft;
              const offsetTop = -1 * c.offsetTop;
              const offsetBottom = c.height - container.offsetHeight + c.offsetTop;

              moveCounter++;

              if (currentDiff.x >= 0 && offsetRight >= 0) {
                c.style.left = `${c.offsetLeft - (currentDiff.x - offsetRight > 0 ? offsetRight : currentDiff.x)}px`;
              } else if (currentDiff.x < 0 && offsetLeft >= 0) {
                c.style.left = `${
                  c.offsetLeft + (-1 * currentDiff.x - offsetLeft > 0 ? offsetLeft : -1 * currentDiff.x)
                }px`;
              }

              if (currentDiff.y >= 0 && offsetBottom >= 0) {
                c.style.top = `${c.offsetTop - (currentDiff.y - offsetBottom > 0 ? offsetBottom : currentDiff.y)}px`;
              } else if (currentDiff.y < 0 && offsetTop >= 0) {
                c.style.top = `${
                  c.offsetTop + (-1 * currentDiff.y - offsetTop > 0 ? offsetTop : -1 * currentDiff.y)
                }px`;
              }
            }
            lastMovePoint = findMouseCursor(e);
          }
        });

        c.addEventListener('mouseout', () => {
          if (isGrabbing) {
            isGrabbing = false;
            lastMovePoint = null;
            moveCounter = 0;
          }
        });

        container.addEventListener('wheel', (e) => {
          // TODO
          // FEATURE : Must add something to zoom around cursor
          e.preventDefault();
          const isZoomIn = e.deltaY < 0;
          const ratioDirection = getRatioDirection(image);

          const offsetRight = c.width - container.offsetWidth + c.offsetLeft;
          const offsetBottom = c.height - container.offsetHeight + c.offsetTop;

          if (!isZoomIn) {
            // for zoom out we check to see wether the ratio is bigger or lesser than 16/9
            // so we could unable user to make the container empty of image
            // TODO we must do a hell of the cleaning for this code
            if (ratioDirection && c.height >= container.offsetHeight) {
              c.style.height = `${
                c.height - (c.height - container.offsetHeight > 50 ? 50 : c.height - container.offsetHeight)
              }px`;

              if (offsetRight <= 0) {
                c.style.left = `${container.offsetWidth - c.width}px`;
              }
              if (offsetBottom <= 0) {
                c.style.top = `${container.offsetHeight - c.height}px`;
              }
            } else if (!ratioDirection && c.width >= container.offsetWidth) {
              c.width = c.width - (c.width - container.offsetWidth > 50 ? 50 : c.width - container.offsetWidth);
              if (offsetRight <= 0) {
                c.style.left = `${container.offsetWidth - c.width}px`;
              }
              if (offsetBottom <= 0) {
                c.style.top = `${container.offsetHeight - c.height}px`;
              }
            }
          } else {
            if (ratioDirection) {
              c.style.height = `${c.height + 50}px`;
            } else {
              c.width = c.width + 50;
            }
          }
        });
      }
    );

    const draw = () => {
      var container = <HTMLDivElement>document.getElementById('image-container');
      var canvasContainer = <HTMLDivElement>document.getElementById('canvas-container');
      var c = <HTMLImageElement>document.getElementById('selected-image');
      var image = new Image();
      image.src = props.selectedImage;

      // const offsetRight = c.width - container.offsetWidth + c.offsetLeft;
      // const offsetBottom = c.height - container.offsetHeight + c.offsetTop;

      image.onload = () => {
        var canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.border = '1px solid';

        console.log(canvasContainer.offsetWidth, image.width, container.offsetWidth, c.width);

        const offsetLeft = c.offsetLeft * (image.width / (container.offsetWidth + c.offsetLeft));
        const offsetTop = c.offsetTop * (image.height / container.offsetHeight);

        const ratio = image.width / image.height;
        const ratioDirection = ratio > props.desiredRatio ? true : false;

        if (ratioDirection) {
          canvas.width = image.height * props.desiredRatio;
          canvas.height = image.height;
        } else {
          canvas.width = image.width;
          canvas.height = image.width / props.desiredRatio;
        }

        //canvas.style.display = "none";
        canvas.id = 'imagemask';
        canvas.style.display = 'none';
        console.log(canvasContainer);
        canvasContainer.appendChild(canvas);
        console.log(image.width, image.height);
        {
          var ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(image, 0, 0, image.width, image.height, offsetLeft, offsetTop, image.width, image.height);

            var img = canvas.toDataURL('image/jpeg', 0.4);
            console.log(img);
          }
        }
      };
    };

    return { draw };
  },
});
</script>
