let img = new Image();
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

document.getElementById("imageUpload").addEventListener("change", function(e) {
  const reader = new FileReader();
  reader.onload = function(event) {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      canvas.style.display = "block";
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

// Encode Message in Blue Channel LSB
function encodeMessage() {
  const message = document.getElementById("message").value + "||END||"; // Append end marker
  if (!message) return alert("Please enter a message.");

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const binaryMsg = messageToBinary(message);

  let data = imgData.data;
  if (binaryMsg.length > data.length / 4) {
    alert("Message is too long for this image.");
    return;
  }

  // Encoding message into the blue channel LSB
  for (let i = 0; i < binaryMsg.length; i++) {
    data[i * 4 + 2] = (data[i * 4 + 2] & 0xFE) | parseInt(binaryMsg[i]); // Blue channel
  }

  ctx.putImageData(imgData, 0, 0);

  const encodedURL = canvas.toDataURL();
  const link = document.getElementById("downloadLink");
  link.href = encodedURL;
  link.style.display = "inline-block";
  link.textContent = "Download Encoded Image";
}

// Convert message to binary (8 bits per character)
function messageToBinary(message) {
  return message.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('');
}

// Decode Message from Blue Channel LSB
document.getElementById("decodeUpload").addEventListener("change", function(e) {
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      let binary = "";
      // Decode from the blue channel LSB
      for (let i = 0; i < imgData.length; i += 4) {
        binary += (imgData[i + 2] & 1); // Read LSB of blue channel
      }

      const chars = binary.match(/.{1,8}/g); // Group every 8 bits (1 byte)
      let message = "";
      for (let i = 0; i < chars.length; i++) {
        const char = String.fromCharCode(parseInt(chars[i], 2));
        if (char === '\0') break; // End of message (null byte)
        message += char;
        if (message.endsWith("||END||")) break; // End marker check
      }

      document.getElementById("decodedMessage").value = message.replace("||END||", "");
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});
