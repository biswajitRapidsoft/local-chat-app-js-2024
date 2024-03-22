document.addEventListener("DOMContentLoaded", function () {
  const chatHeader = document.querySelector(".chat-header");
  const chatMsgs = document.querySelector(".chat-msgs");
  const chatInputForm = document.querySelector(".chat-input-form");
  const chatInput = document.querySelector(".chat-input");
  const clrChatBtn = document.querySelector(".clear-chat-button");
  const currentUser = document.querySelector(".user");
  const body = document.querySelector("body") 

  function updateUserStatusUI(userStatusDivs) {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    userStatusDivs.forEach((div) => {
      const username = div.parentElement.textContent.trim();
      const user = users.find((u) => u.username === username);

      if (user && user.status === true) {
        div.classList.remove("bg-danger");
        div.classList.add("bg-success");
      } else if (user && user.status === false) {
        div.classList.remove("bg-success");
        div.classList.add("bg-danger");
      }
    });
  }

  localStorage.setItem("loggedIn", "false");

  let loggedInUser = sessionStorage.getItem("loggedInUser");
  let receiver = null;
  if (loggedInUser !== null) {
    sessionStorage.setItem("loggedInUser", loggedInUser);
  }

  const messages = JSON.parse(localStorage.getItem("messages")) || [];

  const createChatMsgElement = (msg) => {
    const isSentByLoggedInUser = msg.sender === loggedInUser;

    const alignClass = isSentByLoggedInUser ? "ms-auto" : "me-auto";
    const bgColorClass = isSentByLoggedInUser ? "blue-bg" : "grey-bg";

    return `
            <div class="msg ${bgColorClass} ${alignClass} ">
                <div class="msg-sender">${msg.sender}</div>
                <div class="msg-text">${msg.text}</div>
                <div class="msg-timestamp">${msg.timestamp}</div>
            </div>
        `;
  };

  const updatemsgSender = () => {
    let loggedInUser = sessionStorage.getItem("loggedInUser");
    chatHeader.innerHTML = `Chatting With ${receiver}...`;
    chatInput.placeholder = `Type here, ${loggedInUser}...`;

    chatInput.focus();
  };

  const tabId = Math.random().toString(36).substring(7);

  const sendMsg = (e) => {
    e.preventDefault();
    let loggedInUser = sessionStorage.getItem("loggedInUser");
    const timestamp = new Date().toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    const msg = {
      sender: loggedInUser,
      receiver: receiver,
      text: chatInput.value,
      timestamp: timestamp,
      tabId: tabId,
    };

    let existingMessages = JSON.parse(localStorage.getItem("messages")) || [];

    existingMessages.push(msg);

    localStorage.setItem("messages", JSON.stringify(existingMessages));

    chatMsgs.insertAdjacentHTML("beforeend", createChatMsgElement(msg));

    chatInputForm.reset();
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  };

  chatInputForm.addEventListener("submit", sendMsg);


  clrChatBtn.addEventListener("click", () => {
    const loggedInUser = sessionStorage.getItem("loggedInUser");
    const allMessages = JSON.parse(localStorage.getItem("messages"));

    // PASS BY REFERENCE

    const filteredMessages = allMessages.filter(
        (msg) =>
            (msg.sender === loggedInUser && msg.receiver === receiver) ||
            (msg.sender === receiver && msg.receiver === loggedInUser)
    );
    
    const updatedMessages = allMessages.filter((msg) => !filteredMessages.includes(msg));

    localStorage.setItem("messages", JSON.stringify(updatedMessages));
    loadChatHistory(loggedInUser, receiver);
});


  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const registerBtn = document.getElementById("register-btn");

  const loginContainer = document.querySelector(".login-container");
  const chatContainer = document.querySelector(".chat-container");

  const logoutContainer = document.querySelector(".logout-container");

  const logoutBtn = document.createElement("button");
  logoutBtn.textContent = "Logout";
  logoutBtn.classList.add("btn", "btn-danger", "logout-button", "mt-2", "fw-bold");
  logoutContainer.appendChild(logoutBtn);

  const isLoggedIn = localStorage.getItem("loggedIn") == "true";

  if (isLoggedIn) {
    showChat();
  } else {
    showLogin();
  }

  function showLogin() {
    loginContainer.style.display = "block";
    chatContainer.style.display = "none";
  }

  function showChat() {
    loginContainer.style.display = "none";
    chatContainer.style.display = "grid";
  }

  function registerUser(username, password) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const existingUser = users.find((user) => user.username === username);

    if (existingUser) {
      alert("Username already exists. Please choose another one.");
    } else {
      const newUser = { username, password, status: true };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("loggedIn", "true");
      sessionStorage.setItem("loggedInUser", username);
      showChat();
      displayUserList();
    }
  }

  function loginUser(username, password) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const existingUser = users.find((user) => user.username === username);

    if (existingUser && existingUser.password === password) {
      existingUser.status = true;

      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("loggedIn", "true");
      sessionStorage.setItem("loggedInUser", username);
      chatMsgs.innerHTML = `<h1 class="text-center text-white">Welcome ${username}</h1>`;
      showChat();
      currentUser.textContent = username
      displayUserList();
    } else {
      alert("Invalid username or password. Please try again.");
    }
  }

  function logoutUser() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const loggedInUser = sessionStorage.getItem("loggedInUser");
    const userIndex = users.findIndex((user) => user.username === loggedInUser);

    if (userIndex !== -1) {
      users[userIndex].status = false;
      localStorage.setItem("users", JSON.stringify(users));
    }

    localStorage.removeItem("loggedIn");
    sessionStorage.removeItem("loggedInUser");
    showLogin();
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;
    loginUser(username, password);
  });

  registerBtn.addEventListener("click", function () {
    const username = usernameInput.value;
    const password = passwordInput.value;
    registerUser(username, password);
  });

  logoutBtn.addEventListener("click", logoutUser);

  function loadChatHistory(user1, user2) {
    const filteredMessages = JSON.parse(
      localStorage.getItem("messages")
    ).filter(
      (msg) =>
        (msg.sender === user1 && msg.receiver === user2) ||
        (msg.sender === user2 && msg.receiver === user1)
    );

    chatMsgs.innerHTML = "";

    filteredMessages.forEach((msg) => {
      const newmsg = createChatMsgElement(msg);
      chatMsgs.insertAdjacentHTML("beforeend", newmsg);
    });

    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }

  function displayUserList() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const personSelector = document.querySelector(".person-selector");
    const loggedInUser = sessionStorage.getItem("loggedInUser");

    personSelector.innerHTML = "";

    users.forEach((user) => {
      if (user.username !== loggedInUser) {
        const userButton = document.createElement("button");

        let userIcon = document.createElement('img');
        userIcon.classList.add("user-icon");
        userIcon.src = "./img/user.jpeg";
        userIcon.alt = "user";
        userButton.appendChild(userIcon);

        const usernameSpan = document.createElement("span");
        usernameSpan.textContent = user.username;
        userButton.appendChild(usernameSpan);

        const userStatus = document.createElement("div");
        userStatus.classList.add("user-status", "rounded");
        userButton.appendChild(userStatus);

        userButton.type = "button";
        userButton.classList.add("person-selector-button", "black-bg");
        personSelector.appendChild(userButton);

        userButton.addEventListener("click", (e) => {
          receiver = e.target.textContent;

          clrChatBtn.classList.remove("d-none");

          let allSelected = document.querySelectorAll(".grey-bg");
          allSelected.forEach((selected) => {
            selected.classList.remove("grey-bg");
            selected.classList.add("black-bg");
          });

          userButton.classList.remove("black-bg");
          userButton.classList.add("grey-bg");

          updatemsgSender(receiver);
          loadChatHistory(loggedInUser, receiver);
        });

        const userStatusDivs = document.querySelectorAll(".user-status");

        setInterval(() => {
          updateUserStatusUI(userStatusDivs);
        }, 200);
      }
    });
  }

  window.addEventListener("storage", function (event) {
    if (event.key === "messages" && event.newValue !== null) {
      const updatedMessages = JSON.parse(event.newValue);
      const loggedInUser = sessionStorage.getItem("loggedInUser");

      if (updatedMessages[0].tabId !== tabId) {
        loadChatHistory(loggedInUser, receiver);
      }
    }
  });



  const userSearchInput = document.querySelector(".user-search input");
  const personSelector = document.querySelector(".person-selector");
  const users = JSON.parse(localStorage.getItem("users")) || [];

  function displayFilteredUsers(searchValue) {
    personSelector.innerHTML = "";

    users.forEach((user) => {
      if (user.username !== loggedInUser && user.username.toLowerCase().includes(searchValue.toLowerCase())) {
        const userButton = document.createElement("button");

        let userIcon = document.createElement('img');
        userIcon.classList.add("user-icon");
        userIcon.src = "./img/user.jpeg";
        userIcon.alt = "user";
        userButton.appendChild(userIcon);

        const usernameSpan = document.createElement("span");
        usernameSpan.textContent = user.username;
        userButton.appendChild(usernameSpan);

        const userStatus = document.createElement("div");
        userStatus.classList.add("user-status", "rounded");
        userButton.appendChild(userStatus);

        userButton.type = "button";
        userButton.classList.add("person-selector-button", "black-bg");
        personSelector.appendChild(userButton);

        userButton.addEventListener("click", (e) => {
          receiver = e.target.textContent;

          clrChatBtn.classList.remove("d-none");

          let allSelected = document.querySelectorAll(".grey-bg");
          allSelected.forEach((selected) => {
            selected.classList.remove("grey-bg");
            selected.classList.add("black-bg");
          });

          userButton.classList.remove("black-bg");
          userButton.classList.add("grey-bg");

          updatemsgSender(receiver);
          loadChatHistory(loggedInUser, receiver);
        });

        const userStatusDivs = document.querySelectorAll(".user-status");

        setInterval(() => {
          updateUserStatusUI(userStatusDivs);
        }, 200);
      }
    });
  }

  userSearchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  });

  userSearchInput.addEventListener("input", function (event) {
    const searchValue = event.target.value.trim();

    if (searchValue !== "") {
      displayFilteredUsers(searchValue);
    } else {
      displayFilteredUsers("");
    }
  });


  function checkLoginStatus() {
    const loggedInUser = sessionStorage.getItem("loggedInUser");
    if (loggedInUser) {
      showChat();
      currentUser.textContent = loggedInUser;
      displayUserList();
    } else {
      showLogin();
    }
  }

  const userIsLoggedIn = sessionStorage.getItem("loggedInUser");

  if (userIsLoggedIn) {
    checkLoginStatus();
  }
});