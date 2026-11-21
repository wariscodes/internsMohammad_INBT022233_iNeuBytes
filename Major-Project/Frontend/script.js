
const API_URL = "http://127.0.0.1:5000";

let conversationId = createConversationId();
let sending = false;


// Create a unique conversation ID
function createConversationId() {
    return "conv-" + Date.now() + "-" +
        Math.random().toString(16).slice(2);
}


// Add a message to the chat
function addMessage(text, sender) {
    const chat = document.getElementById("chat");

    const row = document.createElement("div");
    row.className = "row " + sender;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    row.appendChild(bubble);
    chat.appendChild(row);

    chat.scrollTop = chat.scrollHeight;
}


// Send message to Flask backend
async function sendMessage(message) {
    const response = await fetch(API_URL + "/chat", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            message: message,
            conversation_id: conversationId
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Request failed.");
    }

    if (!data.reply) {
        throw new Error("Server returned no reply.");
    }

    return data;
}


// Handle chat form
document.getElementById("chatForm").addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        if (sending) return;

        const input = document.getElementById("message");
        const button = document.getElementById("sendButton");

        const message = input.value.trim();

        if (!message) return;

        addMessage(message, "user");

        input.value = "";
        sending = true;

        button.disabled = true;
        button.textContent = "Wait...";

        try {
            const data = await sendMessage(message);

            addMessage(data.reply, "bot");

            document.getElementById("quick").style.display = "none";

        } catch (error) {
            addMessage(
                "Couldn't connect to backend. Check that Flask is running.\n\n" +
                "Details: " + error.message,
                "bot"
            );

        } finally {
            sending = false;

            button.disabled = false;
            button.textContent = "Send ➤";

            input.focus();
        }
    }
);


// Handle quick buttons
document.getElementById("quick").addEventListener(
    "click",
    function (event) {

        const button = event.target.closest("button");

        if (!button) return;

        const message = button.dataset.message;

        if (message) {
            document.getElementById("message").value = message;
            document.getElementById("message").focus();
        }
    }
);


// Clear conversation
document.getElementById("clearButton").addEventListener(
    "click",
    function () {

        if (sending) return;

        conversationId = createConversationId();

        document.getElementById("chat").innerHTML = "";

        document.getElementById("quick").style.display = "flex";

        addMessage(
            "Hi! I'm AirMate AI. 👋\n\n" +
            "I can help prepare a flight booking, cancellation, or change request.\n\n" +
            "What would you like to do?",
            "bot"
        );

        document.getElementById("message").value = "";
        document.getElementById("message").focus();
    }
);
