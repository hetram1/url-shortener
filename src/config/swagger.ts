import { OpenAPIV3 } from "openapi-types";

export const swaggerDocument: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "URL Shortener API",
    version: "1.0.0",
    description:
      "REST API for creating, managing, redirecting, and analyzing shortened URLs.",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Health", description: "Service health checks" },
    { name: "Authentication", description: "User authentication" },
    { name: "URLs", description: "Short URL management" },
    { name: "Analytics", description: "URL click analytics" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check service health",
        responses: {
          "200": {
            description: "Service is healthy",
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered successfully",
          },
          "400": {
            description: "Invalid registration request",
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Log in",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
          },
          "401": {
            description: "Invalid credentials",
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get the authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Authenticated user",
          },
          "401": {
            description: "Authentication required",
          },
        },
      },
    },
    "/urls": {
      post: {
        tags: ["URLs"],
        summary: "Create a short URL",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateUrlRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Short URL created",
          },
          "400": {
            description: "Invalid request",
          },
          "401": {
            description: "Authentication required",
          },
        },
      },
      get: {
        tags: ["URLs"],
        summary: "List the authenticated user's URLs",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User URLs",
          },
          "401": {
            description: "Authentication required",
          },
        },
      },
    },
    "/urls/{shortCode}": {
      parameters: [
        {
          name: "shortCode",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      put: {
        tags: ["URLs"],
        summary: "Update a short URL",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateUrlRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "URL updated",
          },
          "401": {
            description: "Authentication required",
          },
          "404": {
            description: "URL not found",
          },
        },
      },
      delete: {
        tags: ["URLs"],
        summary: "Delete a short URL",
        security: [{ bearerAuth: [] }],
        responses: {
          "204": {
            description: "URL deleted",
          },
          "401": {
            description: "Authentication required",
          },
          "404": {
            description: "URL not found",
          },
        },
      },
    },
    "/urls/{shortCode}/analytics": {
      get: {
        tags: ["Analytics"],
        summary: "Get URL analytics",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "shortCode",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "URL analytics",
          },
          "401": {
            description: "Authentication required",
          },
          "404": {
            description: "URL not found",
          },
        },
      },
    },
    "/{shortCode}": {
      get: {
        tags: ["URLs"],
        summary: "Redirect a short URL",
        parameters: [
          {
            name: "shortCode",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "302": {
            description: "Redirect to the original URL",
          },
          "404": {
            description: "Short URL not found",
          },
          "410": {
            description: "Short URL has expired",
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
          },
          password: {
            type: "string",
            format: "password",
            minLength: 8,
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
          },
          password: {
            type: "string",
          },
        },
      },
      CreateUrlRequest: {
        type: "object",
        required: ["originalUrl"],
        properties: {
          originalUrl: {
            type: "string",
            format: "uri",
          },
          customAlias: {
            type: "string",
            nullable: true,
          },
          expiresAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
        },
      },
      UpdateUrlRequest: {
        type: "object",
        properties: {
          originalUrl: {
            type: "string",
            format: "uri",
          },
          expiresAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
        },
      },
    },
  },
};
