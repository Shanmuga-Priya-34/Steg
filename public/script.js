// Function to switch between login and sign-up sections
function showSignup() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('signupSection').style.display = 'block';
}

function showLogin() {
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('signupSection').style.display = 'none';
}

// Sign up logic
function signup() {
  const username = document.getElementById('newUsername').value;
  const password = document.getElementById('newPassword').value;

  fetch('http://173.232.112.158:3000/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert('Signup successful!');
      showLogin();
    } else {
      alert('Signup failed.');
    }
  });
}

// Login logic
function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('http://173.232.112.158:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      document.getElementById('loginSection').style.display = 'none';
      document.getElementById('dashboardSection').style.display = 'block';
      document.getElementById('userNameDisplay').innerText = username;
    } else {
      document.getElementById('loginError').innerText = 'Invalid credentials.';
    }
  });
}

// Steganography encode logic
function messageToBinary(message) {
  return message.split('').map(char =>
    char.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');
}

function binaryToMessage(binary) {
  const chars = binary.match(/.{1,8}/g);
  return chars.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
}

function encodeMessage() {
  const message = document.getElementById('message').value + "||END||";
  const binaryMessage = messageToBinary(message);
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  // Make sure the canvas has the correct image drawn
  const imgElement = document.getElementById('encodeUpload');
  const file = imgElement.files[0];
  if (!file) {
    alert('Please upload an image to encode the message.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      if (binaryMessage.length > data.length / 4) {
        alert('Message too long for the selected image.');
        return;
      }

      for (let i = 0; i < binaryMessage.length; i++) {
        data[i * 4 + 2] = (data[i * 4 + 2] & 0xFE) | parseInt(binaryMessage[i]);
      }

      ctx.putImageData(imageData, 0, 0);

      // Now set the download link to the encoded image
      const link = document.getElementById('downloadLink');
      link.href = canvas.toDataURL('image/png');
      link.style.display = 'inline-block';
      link.download = 'encoded_image.png'; // Specify the file name for download
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Steganography decode logic
function decodeMessage() {
  const file = document.getElementById('decodeUpload').files[0];
  if (!file) {
    alert('Please upload an image to decode.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let binaryMessage = '';
      for (let i = 0; i < imgData.length; i += 4) {
        binaryMessage += imgData[i + 2] & 1;
      }

      let message = binaryToMessage(binaryMessage);
      const delimiterIndex = message.indexOf('||END||');
      if (delimiterIndex !== -1) {
        message = message.slice(0, delimiterIndex);
      }

      document.getElementById('decodedMessage').value = message;
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}
