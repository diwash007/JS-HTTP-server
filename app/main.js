const fs = require("fs");
const net = require("net");
const path = require("path");

let directory = "./";
let directoryArgIndex = process.argv.findIndex((arg) => arg === "--directory");
if (directoryArgIndex >= 0) {
  directory = process.argv[directoryArgIndex + 1];
}

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  socket.on("data", (data) => {
    const [method, reqPath, version] = data.toString().split(" ");
    if (reqPath === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (reqPath.slice(0, 6) === "/echo/") {
      const text = reqPath.slice(6);
      socket.write(makeResponse(text));
    } else if (reqPath === "/user-agent") {
      const lines = data.toString().split("\r\n");
      const userAgent = lines[2].split(" ")[1];
      socket.write(makeResponse(userAgent));
    } else if (reqPath.startsWith("/files/")) {
      const fileName = reqPath.slice("/files/".length);
      const filePath = path.resolve(process.argv[3], fileName);
      const fileContent = fs.readFileSync(filePath);
      socket.write(makeResponse(fileContent, "application/octet-stream"));
    } else {
      socket.write("HTTP/1.1 404\r\n\r\n");
    }
  });
});

server.listen(4221, "localhost");

function makeResponse(value, contentType = "text/plain") {
  return (
    "HTTP/1.1 200 OK\r\nContent-Type: " +
    contentType +
    "\r\nContent-Length: " +
    value.length +
    "\r\n\r\n" +
    value
  );
}
