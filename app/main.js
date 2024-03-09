const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  // socket.on("data", (data) => {
  //   socket.write("HTTP/1.1 200 OK\r\n\r\n");
  //   socket.close();
  // });

  socket.on("data", (data) => {
    const [method, path, version] = data.toString().split(" ");
    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else {
      socket.write("HTTP/1.1 404\r\n\r\n");
    }
    socket.close();
  });
});

server.listen(4221, "localhost");
