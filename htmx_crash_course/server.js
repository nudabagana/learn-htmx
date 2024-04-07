import express from "express";
import { setTimeout } from "timers/promises";

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//  Request
app.get("/dragons", (req, res) => {
  const dragons = [
    { id: 1, name: "Loafy" },
    { id: 2, name: "Toothless" },
    { id: 3, name: "Smaug" },
  ];

  res.send(`
  <h1 class="text-2xl font-bold my-4">Dragons</h1>
    <ul>
    ${dragons.map((user) => `<li>${user.name}</li>`).join("")}
    </ul>
  `);
});

app.get("/users", async (req, res) => {
  const limit = +req.query.limit || 10;
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/users?_limit=${limit}`
  );
  const users = await response.json();

  await setTimeout(2000);

  res.send(`
    <h1 class="text-2xl font-bold my-4">Users</h1>
      <ul>
      ${users.map((user) => `<li>${user.name}</li>`).join("")}
      </ul>
    `);
});

// temperature
app.post("/convert", async (req, res) => {
  const fh = parseFloat(req.body.fahrenheit);
  console.log(fh);
  await setTimeout(1000);
  const celsius = (fh - 32) * (5 / 9);
  res.send(`
    <p>
        ${fh} F = ${celsius.toFixed(1)} C
    </p>
    `);
});

// Polling (weather)
let currTemp = 20;
app.get("/get-temperature", (req, res) => {
  currTemp += Math.random() * 2 - 1;
  res.send(currTemp.toFixed(1) + "C");
});

// User Search
app.post("/search/api", async (req, res) => {
  const searchTerm = req.body.search.toLowerCase();

  if (!searchTerm) {
    return res.send(`<tr></tr>`);
  }

  const response = await fetch(
    `https://jsonplaceholder.typicode.com/users`
  );
  const contacts = await response.json();

  const results = contacts.filter((contact) => {
    const name = contact.name.toLowerCase();
    const email = contact.email.toLowerCase();

    return name.includes(searchTerm) || email.includes(searchTerm);
  });
  await setTimeout(1000);

  const resultHtml = results
    .map(
      (contact) =>
        `
    <tr>
        <td><div class="my-4 p-2">${contact.name}</div></td>
        <td><div class="my-4 p-2">${contact.email}</div></td>
    </tr>
    `
    )
    .join("");
  res.send(resultHtml);
});

// Email Validation
app.post('/contact/email', (req,res) => {
    const email = req.body.email;
    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;

    const isValid = {
        message: "That Email is valid",
        class: "text-green-700"
    }

    const isInvalid = {
        message: "Please enter a valid email",
        class: "text-red-700"
    }

    if (!emailRegex.test(email)){
        return res.send(
            `
            <div class="mb-4" hx-target="this" hx-swap="outerHTML">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="email"
              >Email Address</label
            >
            <input
              name="email"
              hx-post="/contact/email"
              class="border rounded-lg py-2 px-3 w-full focus:outline-none focus:border-blue-500"
              type="email"
              id="email"
              required
              value="${email}"
            />
            <div class="${isInvalid.class}">${isInvalid.message}</div>
          </div>
            `
        )
    } else {
        return res.send(
            `
            <div class="mb-4" hx-target="this" hx-swap="outerHTML">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="email"
              >Email Address</label
            >
            <input
              name="email"
              hx-post="/contact/email"
              class="border rounded-lg py-2 px-3 w-full focus:outline-none focus:border-blue-500"
              type="email"
              id="email"
              required
              value="${email}"
            />
            <div class="${isValid.class}">${isValid.message}</div>
          </div>
            `
        )
    }
});

app.listen(3000, () => {
  console.log("Listening on 3000");
});
