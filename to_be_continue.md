**Current Features**

This backend is a campus engagement API built around authenticated student/admin workflows. After `POST /api/auth/login`, all other API routes are protected by JWT middleware in [src/server.js](/home/mostafaessa/Documents/CampusConnect-backend/src/server.js:29).

At a feature level, the project currently supports:

- User/admin management: login, current-user profile, student listing/search, admin-created users, banning users.
- Clubs: create clubs, edit club details, list clubs, view a club, follow/unfollow clubs, report club issues.
- Events: schedule events, list approved events, view an event, register/cancel registration, attendance/check-in, club event requests, event-linked posts, report event issues, admin approval flow.
- Posts/social feed: create/edit posts, news feed, likes, comments.
- Rooms/resources: create rooms, list rooms, reserve rooms, cancel reservations, report room issues, create/list room resources.
- Facilities: admin create facility, student facility issue reporting.
- Admin dashboards: reports, stats, attendance overview, pending event approvals, logs.

**Endpoint Summary**

Implemented and generally wired:

- `POST /api/auth/login`
- `GET /api/users/me`
- `GET /api/users/students`
- `PATCH /api/users/:id/ban`
- `POST /api/users`
- `POST /api/users` search route is actually `POST /api/users/` in [src/routes/user.route.js](/home/mostafaessa/Documents/CampusConnect-backend/src/routes/user.route.js:10) and is used for student search
- Most club endpoints in [src/routes/club.route.js](/home/mostafaessa/Documents/CampusConnect-backend/src/routes/club.route.js:13)
- Most room endpoints in [src/routes/room.route.js](/home/mostafaessa/Documents/CampusConnect-backend/src/routes/room.route.js:7)
- Most admin endpoints in [src/routes/admin.route.js](/home/mostafaessa/Documents/CampusConnect-backend/src/routes/admin.route.js:15)

Implemented but incomplete or likely broken:

- `GET /api/events` is only reliable for the unfiltered list. The filtered branch is broken because `getApprovedEvents()` builds an empty array instead of returning fetched events in [src/services/event.service.js](/home/mostafaessa/Documents/CampusConnect-backend/src/services/event.service.js:33).
- `POST /api/events/:event_id/attendance` looks mismatched: the route is for manager/admin, but the controller checks in `req.user.id` as if that user were the student in [src/routes/event.route.js](/home/mostafaessa/Documents/CampusConnect-backend/src/routes/event.route.js:30) and [src/controllers/event.controller.js](/home/mostafaessa/Documents/CampusConnect-backend/src/controllers/event.controller.js:119).
- `GET /api/events/:event_id/registered_students` and `GET /api/events/:event_id/attendance_list` exist twice, once protected and once public, in [src/routes/event.route.js](/home/mostafaessa/Documents/CampusConnect-backend/src/routes/event.route.js:39).
- `POST /api/posts` and `PUT /api/posts/:post_id` are likely broken because `clubService.getClubIdByManagerId()` is used without `await` in [src/controllers/post.controller.js](/home/mostafaessa/Documents/CampusConnect-backend/src/controllers/post.controller.js:14).
- `PATCH /api/rooms/:id/cancel` is likely broken because the controller expects `result.success`, but the service returns nothing in [src/controllers/room.controller.js](/home/mostafaessa/Documents/CampusConnect-backend/src/controllers/room.controller.js:80).
- `POST /api/admin/facilities` is likely broken because the controller passes an array into a service that expects an object in [src/controllers/facility.controller.js](/home/mostafaessa/Documents/CampusConnect-backend/src/controllers/facility.controller.js:11) and [src/services/facility.service.js](/home/mostafaessa/Documents/CampusConnect-backend/src/services/facility.service.js:9).
- Admin stats/reporting are present, but some values are clearly placeholder or inconsistent, like `reserved_facilities: 0` in [src/services/admin.service.js](/home/mostafaessa/Documents/CampusConnect-backend/src/services/admin.service.js:74).

Not implemented yet:

- Facility routes commented out in [src/routes/facility.route.js](/home/mostafaessa/Documents/CampusConnect-backend/src/routes/facility.route.js:7):
  - `GET /api/facilities`
  - `POST /api/facilities/:id/reserve`
  - `POST /api/facilities/:id/checkin`
- Post deletion is commented out in [src/routes/post.route.js](/home/mostafaessa/Documents/CampusConnect-backend/src/routes/post.route.js:9):
  - `DELETE /api/posts/:post_id`
- There is also an unused `getEventTime()` TODO in [src/services/event.service.js](/home/mostafaessa/Documents/CampusConnect-backend/src/services/event.service.js:162), which suggests event timing-related work is not finished.

If you want, I can turn this into a polished project report section or a clean endpoint checklist table for your docs.
