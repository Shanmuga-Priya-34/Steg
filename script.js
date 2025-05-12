// Mock user data store (for demo purposes)
const users = [];

// Show Signup Form
function showSignupForm() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('signupSection').style.display = 'block';
}

// Show Login Form
function showLoginForm() {
  document.getElementById('signupSection').style.display = 'none';
  document.getElementById('loginSection').style.display = 'block';
}

// Handle Signup
function handleSignup(event) {
  event.preventDefault();

  const username = document.getElementById('signupUsername').value;
  const password = document.getElementById('signupPassword').value;

  if (username && password) {
    // Save the user
    users.push({ username, password });

    alert('Signup successful! You can now login.');
    showLoginForm();
  } else {
    alert('Please fill in both fields.');
  }
}

// Handle Login
function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    alert('Login successful!');
    // Show steganography tool after login
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('encodeSection').style.display = 'block';
    document.getElementById('decodeSection').style.display = 'block';
  } else {
    alert('Invalid username or password.');
  }
}

// Steganography Tool Functions
document.getElementById("upload").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.getElementById("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

function messageToBinary(message) {
  return message.split("").map(char =>
    char.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');
}

function binaryToMessage(binary) {
  const chars = binary.match(/.{1,8}/g);
  return chars.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
}

function handleEncode() {
  const message = document.getElementById("message").value + "||END||";
  const binaryMessage = messageToBinary(message);
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  if (binaryMessage.length > data.length / 4) {
    alert("Message too long for the selected image.");
    return;
  }

  for (let i = 0; i < binaryMessage.length; i++) {
    data[i * 4 + 2] = (data[i * 4 + 2] & 0xFE) | parseInt(binaryMessage[i]);
  }

  ctx.putImageData(imageData, 0, 0);

  const link = document.getElementById("downloadLink");
  link.href = canvas.toDataURL();
  link.style.display = "inline-block";
}

function decodeMessage() {
  const file = document.getElementById("decodeUpload").files[0];
  if (!file) {
    alert("Please upload an image to decode.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let binary = "";

      for (let i = 0; i < imgData.length; i += 4) {
        binary += (imgData[i + 2] & 1);
      }

      const chars = binary.match(/.{1,8}/g);
      let message = "";
      for (let i = 0; i < chars.length; i++) {
        const char = String.fromCharCode(parseInt(chars[i], 2));
        message += char;
        if (message.includes("||END||")) break;
      }

      document.getElementById("decodedMessage").value = message.replace("||END||", "");
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}
