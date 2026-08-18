---
name: api-design-principles
description: Master REST API design principles specific to Node.js and Express to build scalable, maintainable, and robust backend services. Use when designing new Express routes, establishing API standards, or refactoring Express controllers.
---

# Express.js API Design Principles

Master REST API design principles for Node.js and Express to build intuitive, scalable, and maintainable backend services that delight developers and stand the test of time.

## When to Use This Skill

- Designing new Express REST APIs
- Refactoring existing Express routes and controllers
- Establishing Express API design standards for your team
- Reviewing API specifications before implementation in Node.js
- Creating developer-friendly Express API documentation
- Implementing middleware architectures for authentication, validation, and error handling

## Core Concepts

### 1. Resource-Oriented Architecture in Express

- **Noun-based Routes**: Resources are nouns (users, orders), not verbs.
  - Good: `router.get('/users')`
  - Bad: `router.get('/getUsers')`
- **HTTP Methods Semantics**: Use Express router methods properly.
  - `router.get()`: Retrieve resources (idempotent, safe)
  - `router.post()`: Create new resources
  - `router.put()`: Replace entire resource (idempotent)
  - `router.patch()`: Partial resource updates
  - `router.delete()`: Remove resources (idempotent)
- **Nested Resources**: Represent hierarchy logically.
  - `router.get('/users/:userId/orders')`

### 2. The Express Middleware Pattern

Middleware is the backbone of Express. Use it to cleanly separate cross-cutting concerns:

- **Global Middleware**: Apply to all routes (CORS, body parsing, helmet).
- **Route-specific Middleware**: Apply to specific routes (Authentication, Role Authorization, Input Validation).
- **Error Handling Middleware**: A special 4-argument function `(err, req, res, next)` at the end of the middleware chain.

### 3. API Versioning Strategies

**URL Versioning (Recommended in Express):**

```javascript
const v1Router = express.Router();
const v2Router = express.Router();

app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);
```

## Detailed Patterns and Practices

### 1. Controllers and Routing

Keep your routes file clean by extracting logic into controllers.

```javascript
// routes/users.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const { validateUser } = require('../middlewares/validation');

router.get('/', userController.getUsers);
router.post('/', validateUser, userController.createUser);
router.get('/:id', userController.getUserById);

module.exports = router;
```

### 2. Asynchronous Error Handling

Avoid unhandled promise rejections by wrapping async controllers or using `express-async-errors`.

```javascript
// Using a wrapper
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));
```

### 3. Standardized Responses

Maintain a consistent JSON response structure.

```javascript
// Success response
res.status(200).json({
  success: true,
  data: result,
  message: "Operation successful" // optional
});

// Error response
res.status(400).json({
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid email format'
  }
});
```

### 4. Input Validation

Use libraries like Joi, Zod, or express-validator in middleware. Don't validate inside the controller.

```javascript
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.post('/', [body('email').isEmail(), validate], controller.create);
```

## Best Practices

1. **Use HTTP Status Codes Correctly**:
   - `200 OK` for generic success
   - `201 Created` for successful POST
   - `204 No Content` for successful DELETE
   - `400 Bad Request` for validation errors
   - `401 Unauthorized` for missing/invalid auth
   - `403 Forbidden` for lack of permissions
   - `404 Not Found` for resource not found
   - `500 Internal Server Error` for unhandled exceptions
2. **Environment Variables**: Never hardcode secrets. Use `dotenv` and `process.env`.
3. **Pagination**: Always paginate large collections using `req.query.limit` and `req.query.page`.
4. **Rate Limiting**: Protect your API with `express-rate-limit`.
5. **Security**: Use `helmet` to set secure HTTP headers, and `cors` for cross-origin configuration.

## Common Pitfalls

- **Fat Controllers**: Putting too much business logic in controllers. Move logic to a Service layer.
- **Hanging Requests**: Forgetting to call `res.send()` or `next()` leaving the client hanging.
- **Leaking Stack Traces**: Sending raw error details in production. Ensure `NODE_ENV=production` hides them.
- **Ignoring Async Errors**: Uncaught async errors crash Node.js. Always catch them and pass to `next(err)`.
- **Inconsistent Error Formats**: Catch-all error handlers should ensure every error follows the exact same JSON format.
