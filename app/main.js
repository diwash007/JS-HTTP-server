const fs = require("fs");
const net = require("net");
const path = require("path");
const directory = resolveDirectory();

const allowedPaths = ["/echo/", "/user-agent", "/files/"];

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  socket.on("data", (data) => {
    const reqPath = getPath(data);

    if (reqPath === "/") {
      socket.write(makeStatus("200 Ok"));
      return;
    }

    if (!allowedPaths.some((p) => reqPath.startsWith(p))) {
      console.log("hiyaa");
      socket.write(makeStatus("404 NOT_FOUND"));
      return;
    }

    bind("/echo/", data, (data) => {
      const text = reqPath.slice(6);
      console.log(text);
      console.log(reqPath);
      socket.write(makeResponse(text));
    });

    bind("/user-agent", data, (data) => {
      const lines = data.toString().split("\r\n");
      const userAgent = lines[2].split(" ")[1];
      socket.write(makeResponse(userAgent));
    });

    bind("/files/", data, (data) => {
      const fileName = reqPath.slice("/files/".length);
      const filePath = path.resolve(directory, fileName);
      if (!fs.existsSync(filePath)) {
        socket.write("HTTP/1.1 404 NOT_FOUND\r\n\r\n");
        return socket.end();
      }
      const fileContent = fs.readFileSync(filePath);
      socket.write(makeResponse(fileContent, "application/octet-stream"));
    });
  });
});

server.listen(4221, "localhost");

function bind(path, data, resolver) {
  const reqPath = getPath(data);
  if (reqPath.startsWith(path)) {
    return resolver(data);
  }
}

// UTILS
function makeStatus(status) {
  return "HTTP/1.1 " + status + "\r\n\r\n";
}

function getPath(data) {
  const [method, reqPath, version] = data.toString().split(" ");
  return reqPath;
}

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

function resolveDirectory() {
  let directory = "./";
  let directoryArgIndex = process.argv.findIndex(
    (arg) => arg === "--directory"
  );
  if (directoryArgIndex >= 0) {
    directory = process.argv[directoryArgIndex + 1];
  }
  return directory;
}
