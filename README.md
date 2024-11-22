Event Logger Backend

This project is a backend application for logging, retrieving, and broadcasting events using Node.js, Express.js, MongoDB, and WebSocket. It provides a RESTful API for managing event logs and real-time updates via WebSocket.

Features
REST API for creating and retrieving event logs.
MongoDB for storing event data.
WebSocket for real-time broadcasting of new events to connected clients.
Data Integrity with a hash mechanism to link events chronologically.

Prerequisites
Before running this application, ensure you have the following installed:

Node.js (v14 or higher)
MongoDB (v4.4 or higher)
Postman or another API testing tool

Start the server with:
npm start

API Endpoints
GET /events
Retrieve a paginated list of event logs.

Query Parameters:

page (optional): Page number (default: 1)
limit (optional): Number of events per page (default: 100)
Example Request:
curl -X GET http://localhost:3000/events?page=1&limit=10

Response:
[
  {
    "_id": "64fdc8e5a835b1c4d6c5693f",
    "eventType": "Login",
    "sourceAppId": "App1",
    "dataPayload": { "userId": "12345", "action": "loggedIn" },
    "timestamp": "2024-11-22T08:32:05.391Z",
    "previousHash": "",
    "currentHash": "9f65a54d89b051fd08e1b8c36c79fbd8101c9089"
  }
]


POST /events
Log a new event.

Request Body:
{
  "eventType": "Login",
  "sourceAppId": "App1",
  "dataPayload": { "userId": "12345", "action": "loggedIn" }
}

{
  "eventType": "Login",
  "sourceAppId": "App1",
  "dataPayload": { "userId": "12345", "action": "loggedIn" }
}
Example Request:
curl -X POST http://localhost:3000/events \
-H "Content-Type: application/json" \
-d '{"eventType":"Login","sourceAppId":"App1","dataPayload":{"userId":"12345","action":"loggedIn"}}'

Response:
{
  "message": "Event logged successfully",
  "event": {
    "_id": "64fdc8e5a835b1c4d6c5693f",
    "eventType": "Login",
    "sourceAppId": "App1",
    "dataPayload": { "userId": "12345", "action": "loggedIn" },
    "timestamp": "2024-11-22T08:32:05.391Z",
    "previousHash": "",
    "currentHash": "9f65a54d89b051fd08e1b8c36c79fbd8101c9089"
  }
}

WebSocket Integration
The application supports real-time notifications for new events using WebSocket.

Connect to the WebSocket server at ws://localhost:3000.
Clients will receive updates in the following format when a new event is logged:
{
  "_id": "64fdc8e5a835b1c4d6c5693f",
  "eventType": "Login",
  "sourceAppId": "App1",
  "dataPayload": { "userId": "12345", "action": "loggedIn" },
  "timestamp": "2024-11-22T08:32:05.391Z",
  "previousHash": "",
  "currentHash": "9f65a54d89b051fd08e1b8c36c79fbd8101c9089"
}

Implementation Steps
1. Event Schema and Model
Defined a mongoose.Schema for the Event model.
Added a pre("save") hook to calculate previousHash and currentHash for data integrity.
2. REST API
Created endpoints for logging (POST /events) and retrieving (GET /events) events.
Used pagination for fetching large datasets.
3. Database Connection
Connected to MongoDB using mongoose.connect() with the URI stored in .env.
4. WebSocket Server
Implemented a WebSocket server using ws to broadcast new events in real time.
Set up a MongoDB change stream to monitor new event insertions.
5. Testing
Tested API endpoints using Postman.
Verified WebSocket updates using a simple WebSocket client.

Testing Tools
Postman: For testing REST API endpoints.
WebSocket Client: To verify WebSocket notifications.
Challenges
Ensured data integrity with hash chaining for events.
Handled real-time updates efficiently using MongoDB change streams.
Future Improvements
Add authentication for API and WebSocket connections.
Introduce rate limiting to prevent abuse.
Implement advanced error handling and validation.