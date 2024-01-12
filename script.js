var colour = $(".selected").css("background-color");
var $canvas = $("canvas");
var context = $canvas[0].getContext("2d");
var lastEvent;
var mouseDown = false;
let myCanvas = document.getElementById("mainCanvas");
let targetColor = { r: 0, g: 0, b: 0 }; // Чорний колір
let amountOfRandomDots;
// let points = getPointsByColor(myCanvas, targetColor);

// When clicking on colours items
$(".controls").on("click", "li", function () {
  //  Deselect aibling elements
  $(this).siblings().removeClass("selected");
  //  Select clicked element
  $(this).addClass("selected");

  // Cache current colour
  colour = $(this).css("background-color");
});

// When New colour is pressed by user
$("#revealColorSelect").click(function () {
  // Show colour select or hide the color select
  changeColor();
  $("#colorSelect").toggle();
});

// Update the new colour span
function changeColor() {
  var r = $("#red").val();
  var g = $("#green").val();
  var b = $("#blue").val();
  $("#newColor").css("background-color", "rgb(" + r + "," + g + "," + b + ")");
}

// Reset input field
function clearInput() {
  $("#dotsInput").val("");
}

// When new colour sliders change
$("input[type=range]").change(changeColor);

// When add colour is pressed
$("#addNewColor").click(function () {
  // Append the colours to the controls
  var $newColor = $("<li></li>");
  $newColor.css("background-color", $("#newColor").css("background-color"));
  $(".controls ul").append($newColor);
  // Select the new added colour
  $newColor.click();
});

// On mouse events on the canvas
$canvas
  .mousedown(function (e) {
    lastEvent = e;
    mouseDown = true;
  })
  .mousemove(function (e) {
    // Draw lines
    if (mouseDown) {
      context.beginPath();
      context.moveTo(lastEvent.offsetX, lastEvent.offsetY);
      context.lineTo(e.offsetX, e.offsetY);
      context.strokeStyle = colour;
      context.lineWidth = 5;
      context.lineCap = "round";
      context.stroke();
      lastEvent = e;
    }
  })
  .mouseup(function () {
    mouseDown = false;
  })
  .mouseleave(function () {
    $canvas.mouseup();
  });

// Clear the canvas when button is clicked
function clear_canvas_width() {
  var s = document.getElementById("mainCanvas");
  var w = s.width;
  s.width = 10;
  s.width = w;
  // hide result block
  document.getElementById("resultBlock").classList.add("hidden");
  // reset input
  clearInput();
}

// Monte-Carlo algorithm
// Витягуємо вершини з канвасу
function getPointsByColor(canvas, targetColor) {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let points = [];

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      let index = (y * canvas.width + x) * 4;
      let r = data[index];
      let g = data[index + 1];
      let b = data[index + 2];

      // Порівняння поточного кольору пікселя з цільовим кольором
      if (r === targetColor.r && g === targetColor.g && b === targetColor.b) {
        points.push({ x, y });
      }
    }
  }

  return points;
}

// set input field value
$("#dotsInput").on("change", function (event) {
  amountOfRandomDots = event.target.value;
});

// Функція для генерації випадкової точки всередині прямокутника
function generateRandomPoint(minX, minY, maxX, maxY) {
  return {
    x: Math.random() * (maxX - minX) + minX,
    y: Math.random() * (maxY - minY) + minY,
  };
}

// Функція для перевірки, чи точка знаходиться всередині фігури
function isPointInFigure(point, figure) {
  const ctx = myCanvas.getContext("2d");
  let intersects = 0;
  for (let i = 0; i < figure.length; i++) {
    let j = (i + 1) % figure.length;
    let segment = [figure[i], figure[j]];

    let x1 = segment[0].x;
    let y1 = segment[0].y;
    let x2 = segment[1].x;
    let y2 = segment[1].y;

    if (y1 > y2) {
      let tmpX = x1,
        tmpY = y1;
      x1 = x2;
      y1 = y2;
      x2 = tmpX;
      y2 = tmpY;
    }

    if (point.y == y1 || point.y == y2) point.y += 0.0001;

    if (point.y > y2 || point.y < y1 || point.x > Math.max(x1, x2)) continue;

    if (point.x < Math.min(x1, x2)) {
      intersects++;
      continue;
    }

    let m = (y2 - y1) / (x2 - x1);
    let bee = y1 - m * x1;
    let x = (point.y - bee) / m;

    if (x > point.x) intersects++;
  }

  // Якщо кількість перетинів непарна, точка всередині фігури
  let isInFigure = intersects % 2 !== 0;
  // Встановлення кольору точки
  ctx.fillStyle = isInFigure ? "blue" : "gray";
  ctx.beginPath();
  ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI); // Малювання точки радіусом 2
  ctx.fill();

  return isInFigure;
}

// Функція для обчислення площі фігури методом Монте-Карло
function calculateArea() {
  let insideCount = 0;
  const figure = getPointsByColor(myCanvas, targetColor);
  // Визначте межі для генерації точок
  let [minX, minY, maxX, maxY] = drawBoundingBox(myCanvas, figure);

  for (let i = 0; i < amountOfRandomDots; i++) {
    let point = generateRandomPoint(minX, minY, maxX, maxY);
    if (isPointInFigure(point, figure)) {
      insideCount++;
    }
  }

  let totalArea = ((maxX - minX) * (maxY - minY)).toFixed(2);
  let figureArea = ((insideCount / amountOfRandomDots) * totalArea).toFixed(2);

  // Вивід результату на екран
  document.getElementById("figureArea").innerHTML = `${figureArea}`;
  document.getElementById("squareArea").innerHTML = `${totalArea}`;
  document.getElementById("resultBlock").classList.remove("hidden");

  return figureArea;
}
function drawBoundingBox(canvas, points) {
  if (points.length === 0) return;

  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;

  for (let i = 1; i < points.length; i++) {
    minX = Math.min(minX, points[i].x);
    minY = Math.min(minY, points[i].y);
    maxX = Math.max(maxX, points[i].x);
    maxY = Math.max(maxY, points[i].y);
  }

  const ctx = canvas.getContext("2d");
  ctx.strokeStyle = "black"; // Виберіть колір для рамки
  ctx.lineWidth = "1px";
  ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
  return [minX, minY, maxX, maxY];
}

// Використання функції
// let figure = ...; // Ваша фігура
// let area = calculateArea(figure, 1000); // 1000 - кількість точок для генерації
// console.log("Приблизна площа фігури: " + area);
