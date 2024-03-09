const net = require("net");

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  socket.on("data", (data) => {
    const [method, path, version] = data.toString().split(" ");
    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (path.slice(0, 6) === "/echo/") {
      const text = path.slice(6);
      socket.write(
        "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: " +
          text.length +
          "\r\n\r\n" +
          text +
          "\r\n\r\n"
      );
    } else if (path === "/user-agent") {
      const lines = data.toString().split("\r\n");
      const userAgent = lines[2].split(" ")[1];
      socket.write(
        "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: " +
          userAgent.length +
          "\r\n\r\n" +
          userAgent
      );
    } else {
      socket.write("HTTP/1.1 404\r\n\r\n");
    }
  });
});

server.listen(4221, "localhost");
