// Crea elemento video
const video = document.createElement("video");

// Nuestro canvas
const canvasElement = document.getElementById("qr-canvas");
const canvas = canvasElement.getContext("2d");

// Botón para iniciar el escaneo
const btnScanQR = document.getElementById("btn-scan-qr");

// Estado de la cámara
let scanning = false;

// URL del Webhook de Slack
const SLACK_WEBHOOK_URL = ""; 

// Función para encender la cámara
const encenderCamara = () => {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then((stream) => {
      scanning = true;
      btnScanQR.hidden = true;
      canvasElement.hidden = false;
      video.setAttribute("playsinline", true); // Evitar fullscreen en iOS
      video.srcObject = stream;
      video.play();
      tick();
      scan();
    })
    .catch((error) => {
      console.error("Error al acceder a la cámara:", error);
      Swal.fire("Error", "No se pudo acceder a la cámara. Asegúrate de dar permisos.", "error");
    });
};

// Renderizar el video en el canvas
function tick() {
  if (!video.videoHeight || !video.videoWidth) {
    requestAnimationFrame(tick);
    return;
  }

  canvasElement.height = video.videoHeight;
  canvasElement.width = video.videoWidth;
  canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

  if (scanning) {
    requestAnimationFrame(tick);
  }
}

// Intentar escanear QR
function scan() {
  try {
    qrcode.decode();
  } catch (e) {
    if (scanning) {
      setTimeout(scan, 300);
    }
  }
}

// Apagar la cámara
const cerrarCamara = () => {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach((track) => track.stop());
  }
  scanning = false;
  canvasElement.hidden = true;
  btnScanQR.hidden = false;
};

// Activar sonido al escanear
const activarSonido = () => {
  const audio = document.getElementById("audioScaner");
  if (audio) {
    audio.play().catch((error) => console.error("Error reproduciendo sonido:", error));
  }
};

// Callback cuando se detecta un código QR
qrcode.callback = (respuesta) => {
  if (respuesta) {
    Swal.fire("Código escaneado", respuesta, "success");
    activarSonido();
    cerrarCamara();
    enviarMensajeSlack(respuesta);
  }
};

// Función para enviar mensaje a Slack
function enviarMensajeSlack(mensaje) {
  fetch("http://localhost:3000/send-to-slack", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensaje: `✅ Ya llego: ${mensaje} 🕑 Hora: ${new Date().toLocaleString()}` }),
  })
    .then((response) => response.json())
    .then((data) => console.log("Mensaje enviado a Slack:", data))
    .catch((error) => console.error("Error enviando a Slack:", error));
}

// Evento para encender la cámara automáticamente al cargar la página
window.addEventListener("load", encenderCamara);
