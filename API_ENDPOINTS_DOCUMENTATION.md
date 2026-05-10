# CampusConnect API Endpoints Documentation

## Authentication

### Login

**POST /api/auth/login**

Authenticate user and receive JWT token.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "student|club_manager|admin",
    "first_name": "John",
    "last_name": "Doe",
    "user_name": "johndoe"
  }
}
```

---

## User Management

### Get Current User Profile

**GET /api/users/me**

Retrieve the authenticated user's profile information.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "student",
  "first_name": "John",
  "last_name": "Doe",
  "user_name": "johndoe"
}
```

---

### Get All Students

**GET /api/users/students**

Admin only. Retrieve list of all students in the system.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response (200):**

```json
[
  {
    "student_id": 1,
    "student_name": "John Doe",
    "faculty": "Engineering",
    "major": "Computer Science",
    "student_email": "john@example.com",
    "status": "active|banned",
    "reservations": 5,
    "complaints": 2
  }
]
```

---

### Search for Student

**GET /api/users/?search=query**

Admin only. Search students by name, email, or ID.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `search` (string): Search query

**Response (200):**

```json
[
  {
    "student_id": 1,
    "student_name": "John Doe",
    "faculty": "Engineering",
    "major": "Computer Science",
    "student_email": "john@example.com",
    "status": "active",
    "reservations": 5,
    "complaints": 2
  }
]
```

---

### Ban User

**PATCH /api/users/:id/ban**

Admin only. Ban a student from the platform.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response (200):**

```json
{
  "message": "User banned successfully"
}
```

---

### Create User

**POST /api/admin/users**

Admin only. Create a new user in the system.

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**

```json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "first_name": "Jane",
  "last_name": "Smith",
  "user_name": "janesmith",
  "role": "student|club_manager"
}
```

**Response (201):**

```json
{
  "message": "User created successfully",
  "user_id": 2
}
```

---

## Club Management

### Create Club

**POST /api/clubs**

Admin only. Create a new club.

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**

```json
{
  "name": "Tech Club",
  "description": "A club for technology enthusiasts",
  "email": "techclub@campus.com",
  "logo": "https://example.com/logo.png",
  "cover": "https://example.com/cover.png"
}
```

**Response (201):**

```json
{
  "message": "Club created successfully",
  "club_id": 1
}
```

---

### Get All Clubs

**GET /api/clubs**

Retrieve list of all clubs with basic information.

**Response (200):**

```json
[
  {
    "id": 1,
    "name": "Tech Club",
    "description": "A club for technology enthusiasts",
    "email": "techclub@campus.com",
    "logo": "https://example.com/logo.png",
    "cover": "https://example.com/cover.png",
    "followers_count": 150,
    "members": 25,
    "event_number": 5,
    "posts_number": 12,
    "club_admin_name": "John Doe",
    "status": "active|pending|rejected",
    "is_joined": false
  }
]
```

---

### Get Club Details

**GET /api/clubs/:id**

Get detailed information about a specific club.

**Response (200):**

```json
{
  "id": 1,
  "name": "Tech Club",
  "description": "A club for technology enthusiasts",
  "email": "techclub@campus.com",
  "logo": "https://example.com/logo.png",
  "cover": "https://example.com/cover.png",
  "followers_count": 150,
  "members": 25,
  "event_number": 5,
  "posts_number": 12,
  "club_admin_name": "John Doe",
  "status": "active",
  "is_joined": true
}
```

---

### Update Club

**PUT /api/clubs/:id**

Club manager or admin. Update club information.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**

```json
{
  "name": "Tech Club Updated",
  "description": "Updated description",
  "email": "newemail@campus.com",
  "logo": "https://example.com/new-logo.png",
  "cover": "https://example.com/new-cover.png"
}
```

**Response (200):**

```json
{
  "message": "Club updated successfully"
}
```

---

### Report Club Issue

**POST /api/clubs/report**

Student. Report an issue with a club.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**

```json
{
  "club_id": 1,
  "reason": "Inappropriate content",
  "details": "The club posted offensive content on their page"
}
```

**Response (200):**

```json
{
  "message": "Report submitted successfully"
}
```

---

## Event Management

### Create Event

**POST /api/events**

Club manager or admin. Schedule a new event.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**

```json
{
  "title": "Tech Workshop",
  "description": "Learn about web development",
  "start_time": "2026-05-15T14:00:00",
  "end_time": "2026-05-15T16:00:00",
  "location": "Room 101, Building A",
  "type": "event|session",
  "max_registrations": 50,
  "event_id": null
}
```

**Response (201):**

```json
{
  "message": "Event created successfully",
  "event_id": 1
}
```

---

### Get All Approved Events

**GET /api/events**

Retrieve list of all approved/scheduled events.

**Query Parameters (optional):**

- `type`: Filter by "event" or "session"

**Response (200):**

```json
[
  {
    "event_id": 1,
    "type": "event",
    "club_name": "Tech Club",
    "club_logo_url": "https://example.com/logo.png",
    "club_cover_url": "https://example.com/cover.png",
    "title": "Tech Workshop",
    "description": "Learn about web development",
    "start_time": "2026-05-15T14:00:00",
    "end_time": "2026-05-15T16:00:00",
    "location": "Room 101, Building A",
    "registrations": 25,
    "max_registrations": 50,
    "status": "scheduled",
    "is_registered": false
  }
]
```

---

### Get Event Details

**GET /api/events/:event_id**

Get detailed information about a specific event.

**Response (200):**

```json
{
  "event_id": 1,
  "type": "event",
  "club_name": "Tech Club",
  "title": "Tech Workshop",
  "description": "Learn about web development",
  "start_time": "2026-05-15T14:00:00",
  "end_time": "2026-05-15T16:00:00",
  "location": "Room 101, Building A",
  "registrations": 25,
  "max_registrations": 50,
  "status": "scheduled",
  "is_registered": false
}
```

### Check In Student to Event

**POST /api/events/:id/attendance**

Club manager or admin. Mark student as attended.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**

```json
{
  "student_id": 5
}
```

**Response (200):**

```json
{
  "message": "Student checked in successfully"
}
```

---

### Delete Event

**DELETE /api/events/:event_id**

Club manager or admin. Delete an event.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "message": "Event deleted successfully"
}
```

---

### Get Registered Students

**GET /api/events/:event_id/registered_students**

Club manager. Get list of students registered for an event.

**Headers:**

```
Authorization: Bearer <club_manager_token>
```

**Response (200):**

```json
[
  {
    "id": 5,
    "email": "student@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "user_name": "janesmith"
  }
]
```

---

### Get Event Attendance List

**GET /api/events/:event_id/attendance_list**

Club manager. Get list of students who attended the event.

**Headers:**

```
Authorization: Bearer <club_manager_token>
```

**Response (200):**

```json
[
  {
    "id": 5,
    "email": "student@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "user_name": "janesmith"
  }
]
```

---

### Get Event Posts

**GET /api/events/:id/posts**

Get all posts associated with an event.

**Response (200):**

```json
[
  {
    "post_id": 1,
    "club_id": 1,
    "event_id": 1,
    "content": "Great event!",
    "image_url": "https://example.com/image.jpg",
    "created_at": "2026-05-15T16:30:00",
    "like_count": 10,
    "comment_count": 3,
    "is_liked": false
  }
]
```

---

### Report Event Issue

**POST /api/events/report**

Student. Report an issue with an event.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**

```json
{
  "event_id": 1,
  "reason": "Event cancelled",
  "details": "The event was cancelled without notice"
}
```

**Response (200):**

```json
{
  "message": "Report submitted successfully"
}
```

---

## Room Management

### Create Room

**POST /api/admin/rooms**

Admin only. Create a new room.

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**

```json
{
  "room_number": 101,
  "building_name": "Building A",
  "capacity": 30,
  "type": "classroom|lab|meeting",
  "start_time": 8,
  "end_time": 20,
  "is_available": true,
  "resources_ids": [1, 2, 3]
}
```

**Response (201):**

```json
{
  "message": "Room created successfully"
}
```

---

### Get All Rooms

**GET /api/rooms**

Get list of all available rooms.

**Response (200):**

```json
[
  {
    "id": 1,
    "name": 101,
    "room_number": 101,
    "building_name": "Building A",
    "capacity": 30,
    "type": "classroom",
    "status": "available",
    "start_time": 8,
    "end_time": 20,
    "resources": ["Projector", "Whiteboard"]
  }
]
```

### Create Resource

**POST /api/rooms/resources**

Admin only. Create a new room resource type.

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**

```json
{
  "name": "Projector"
}
```

**Response (201):**

```json
{
  "message": "Resource created successfully",
  "resource_id": 1
}
```

---

### Get All Resources

**GET /api/rooms/resources**

Get list of all available room resources.

**Response (200):**

```json
[
  {
    "resource_id": 1,
    "name": "Projector"
  },
  {
    "resource_id": 2,
    "name": "Whiteboard"
  }
]
```

---

### Report Room Issue

**POST /api/rooms/report**

Student. Report an issue with a room.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**

```json
{
  "room_id": 1,
  "reason": "Damaged furniture",
  "details": "The desk is broken and needs repair"
}
```

**Response (200):**

```json
{
  "message": "Report submitted successfully"
}
```

---

## Facility Management

### Create Facility

**POST /api/admin/facilities**

Admin only. Create a new facility (gym, playground).

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**

```json
{
  "name": "Main Gym",
  "type": "gym|playground",
  "location_description": "Near the cafeteria",
  "min_capacity": 5,
  "max_capacity": 100
}
```

**Response (201):**

```json
{
  "message": "Facility created successfully",
  "facility_id": 1
}
```

---

### Get All Facilities

**GET /api/facilities**

Get list of all available facilities.

**Response (200):**

```json
[
  {
    "facility_id": 1,
    "name": "Main Gym",
    "type": "gym",
    "location_description": "Near the cafeteria",
    "min_capacity": 5,
    "max_capacity": 100,
    "status": "available"
  }
]
```

### Report Facility Issue

**POST /api/facilities/report**

Student. Report an issue with a facility.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**

```json
{
  "facility_id": 1,
  "reason": "Equipment broken",
  "details": "The treadmill is not working"
}
```

**Response (200):**

```json
{
  "message": "Report submitted successfully"
}
```

---

## Posts Management

### Create Post

**POST /api/posts**

Club manager or admin. Create a new post.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**

```json
{
  "event_id": 1,
  "content": "Check out our upcoming tech workshop!",
  "image_url": "https://example.com/image.jpg"
}
```

**Response (201):**

```json
{
  "message": "Post created successfully"
}
```

---

### Get News Feed

**GET /api/posts**

Get all posts from followed clubs.

**Response (200):**

```json
{
  "newsFeed": [
    {
      "post_id": 1,
      "club_id": 1,
      "event_id": 1,
      "content": "Check out our upcoming tech workshop!",
      "image_url": "https://example.com/image.jpg",
      "created_at": "2026-05-10T10:00:00",
      "like_count": 15,
      "comment_count": 5,
      "is_liked": false,
      "comments": []
    }
  ]
}
```

---

### Update Post

**PUT /api/posts/:post_id**

Club manager or admin. Update a post.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**

```json
{
  "new_content": "Updated post content"
}
```

**Response (200):**

```json
{
  "message": "Post updated successfully"
}
```

---

### Delete Post

**DELETE /api/posts/:post_id**

Club manager or admin. Delete a post.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "message": "Post deleted successfully"
}
```

---

### Like Post

**POST /api/posts/:id/like**

Student. Like a post.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "message": "Post liked successfully"
}
```

---

### Unlike Post

**DELETE /api/posts/:id/like**

Student. Remove like from a post.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "message": "Post unliked successfully"
}
```

---

### Add Comment to Post

**POST /api/posts/:id/comments**

Student. Add a comment to a post.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**

```json
{
  "comment": "Great post!"
}
```

**Response (200):**

```json
{
  "message": "Comment added successfully"
}
```

---

### Get Post Comments

**GET /api/posts/:id/comments**

Get all comments for a post.

**Response (200):**

```json
{
  "comments": [
    {
      "student_name": "John Doe",
      "student_image_url": "https://example.com/avatar.jpg",
      "content": "Great post!",
      "created_at": "2026-05-11T12:00:00"
    }
  ]
}
```

---

## Admin Dashboard

### Get Reports

**GET /api/admin/report**

Admin only. Get all reported issues.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response (200):**

```json
[
  {
    "report_id": 1,
    "report_type": "club|event|room|facility",
    "status": "open|in_progress|resolved",
    "details": "Issue details",
    "reason": "Reason for report",
    "created_at": "2026-05-10T10:00:00"
  }
]
```

---

### Get Statistics

**GET /api/admin/stats**

Admin only. Get dashboard statistics.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response (200):**

```json
{
  "total_students": 500,
  "active_clubs": 15,
  "active_events": 8,
  "active_sessions": 5,
  "reserved_rooms": 12,
  "reserved_facilities": 6
}
```

---

### Get Attendance Overview

**GET /api/admin/attendance**

Admin only. Get attendance statistics.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response (200):**

```json
[
  {
    "month": "January",
    "events": 12,
    "sessions": 8
  },
  {
    "month": "February",
    "events": 15,
    "sessions": 10
  }
]
```

---

### Get Facilities Usage

**GET /api/admin/facilities-usage**

Admin only. Get facilities usage statistics.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response (200):**

```json
[
  {
    "type": "room",
    "value": 145
  },
  {
    "type": "gym",
    "value": 89
  },
  {
    "type": "playground",
    "value": 56
  }
]
```

---

### Get Pending Events for Approval

**GET /api/admin/approvals/events**

Admin only. Get list of events pending approval.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response (200):**

```json
[
  {
    "event_id": 1,
    "club_name": "Tech Club",
    "club_logo_url": "https://example.com/logo.png",
    "type": "event|session",
    "description": "Tech workshop",
    "start_time": "2026-05-15T14:00:00",
    "end_time": "2026-05-15T16:00:00",
    "max_registerations": 50
  }
]
```

---

### Approve/Reject Event

**PATCH /api/admin/approvals/events/:id**

Admin only. Approve or reject an event.

**Headers:**

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**

```json
{
  "status": "approved|rejected"
}
```

**Response (200):**

```json
{
  "message": "Event approved successfully"
}
```

---

### Get System Logs

**GET /api/admin/logs**

Admin only. Get system activity logs.

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response (200):**

```json
[
  {
    "ip_address": "192.168.1.1",
    "user_type": "student|admin|club_manager",
    "record_id": "1",
    "edited_table": "posts|events|rooms|etc",
    "action": "create|update|delete|comment",
    "changed_by": "user_id",
    "timestamp": "2026-05-10T10:30:00"
  }
]
```

## Error Responses

All endpoints may return error responses in the following formats:

**400 Bad Request:**

```json
{
  "message": "Missing or invalid required fields"
}
```

**401 Unauthorized:**

```json
{
  "message": "Unauthorized access"
}
```

**403 Forbidden:**

```json
{
  "message": "forbidden",
  "details": "Detailed reason for forbidden access"
}
```

**404 Not Found:**

```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error:**

```json
{
  "message": "Internal server error",
  "details": "Error details"
}
```

---

## Authentication Notes

- All endpoints except `/api/auth/login` require a valid JWT token in the `Authorization` header
- Format: `Authorization: Bearer <token>`
- Tokens expire and must be refreshed by logging in again
- Role-based access control is enforced on protected endpoints

## Rate Limiting

Currently no rate limiting is implemented. Consider adding for production.

## Pagination

Currently no pagination is implemented. Consider adding for endpoints returning large lists (events, clubs, etc).
