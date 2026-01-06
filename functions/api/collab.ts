
// Note: This in-memory solution will not work correctly in a distributed environment
// where multiple instances of the function may be running. A Durable Object or
// another external store would be needed for a robust multi-user implementation.
const rooms = new Map<string, Set<WebSocket>>();

function getRoom(projectId: string): Set<WebSocket> {
  if (!rooms.has(projectId)) {
    rooms.set(projectId, new Set());
  }
  return rooms.get(projectId)!;
}

function handleSession(socket: WebSocket, projectId: string) {
  const room = getRoom(projectId);
  room.add(socket);

  socket.addEventListener("message", (event) => {
    // Broadcast the message to all other clients in the same room.
    // This implements the "Last Write Wins" strategy.
    for (const client of room) {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(event.data);
      }
    }
  });

  const closeOrErrorHandler = () => {
    // Remove the client from the room.
    room.delete(socket);
    // If the room is empty, delete it to free up memory.
    if (room.size === 0) {
      rooms.delete(projectId);
    }
  };

  socket.addEventListener("close", closeOrErrorHandler);
  socket.addEventListener("error", closeOrErrorHandler);
}

export const onRequest: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");

  if (!projectId) {
    return new Response("Missing projectId query parameter", { status: 400 });
  }

  // The request needs to have the Upgrade header for WebSockets.
  const upgradeHeader = request.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  // Create the WebSocket pair.
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  // This is the server-side socket.
  // @ts-ignore Cloudflare specific API
  server.accept();
  handleSession(server, projectId);

  // Return the client-side socket to the user.
  return new Response(null, {
    status: 101,
    webSocket: client,
  });
};
